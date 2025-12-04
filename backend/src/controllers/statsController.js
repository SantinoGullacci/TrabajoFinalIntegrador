const { Order, Appointment, Product } = require('../db');
const { Op } = require('sequelize'); // Importamos operadores lógicos

const getAdminStats = async (req, res) => {
    try {
        // 1. Calcular dinero total recaudado (Suma la columna 'total' de Orders)
        const totalSales = await Order.sum('total') || 0;

        // 2. Contar cantidad total de turnos
        const totalAppointments = await Appointment.count();

        // 3. Contar turnos pendientes (Opcional, pero útil)
        const pendingAppointments = await Appointment.count({
            where: { status: 'pending' }
        });

        // 4. Buscar productos con stock CRÍTICO (menos de 5 unidades)
        const lowStockProducts = await Product.findAll({
            where: {
                stock: { [Op.lt]: 5 } // "lt" significa "Less Than" (Menor que)
            },
            attributes: ['name', 'stock'] // Solo nos importa el nombre y cuánto queda
        });

        res.json({
            money: totalSales,
            appointments: {
                total: totalAppointments,
                pending: pendingAppointments
            },
            alerts: lowStockProducts
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAdminStats };