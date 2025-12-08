const { Order, Appointment, Product, Service } = require('../db'); // <--- Importamos Service
const { Op } = require('sequelize');

const getAdminStats = async (req, res) => {
    try {
        // 1. Dinero de PRODUCTOS (Ventas)
        const totalProductSales = await Order.sum('total') || 0;

        // 2. Dinero de SERVICIOS (Turnos completados)
        // Buscamos todos los turnos completados e incluimos el precio del servicio
        const completedAppointments = await Appointment.findAll({
            where: { status: 'completed' }, // O 'confirmed', según como lo llames. Usaremos 'completed'
            include: [{
                model: Service,
                attributes: ['price']
            }]
        });

        // Sumamos manual (Reduce)
        const totalServiceIncome = completedAppointments.reduce((acc, appt) => {
            return acc + (appt.Service ? appt.Service.price : 0);
        }, 0);

        // TOTAL COMBINADO
        const totalMoney = totalProductSales + totalServiceIncome;

        // 3. Contar turnos
        const totalAppointments = await Appointment.count();
        const pendingAppointments = await Appointment.count({ where: { status: 'pending' } });

        // 4. Alertas de Stock
        const lowStockProducts = await Product.findAll({
            where: { stock: { [Op.lt]: 5 } },
            attributes: ['name', 'stock']
        });

        res.json({
            money: totalMoney, // <--- Ahora devuelve la suma real
            appointments: {
                total: totalAppointments,
                pending: pendingAppointments
            },
            alerts: lowStockProducts
        });

    } catch (error) {
        console.error(error); // Para ver errores en consola
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAdminStats };