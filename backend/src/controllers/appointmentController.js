const { Appointment, User, Service } = require('../db');

// Crear un nuevo turno
const createAppointment = async (req, res) => {
    try {
        const { date, time, UserId, ServiceId } = req.body;

        if (!date || !time || !UserId || !ServiceId) {
            return res.status(400).json({ error: "Faltan datos (fecha, hora, usuario o servicio)" });
        }

        // Creamos el turno
        const newAppointment = await Appointment.create({
            date,
            time,
            UserId,     // Sequelize espera este nombre exacto por la relación
            ServiceId   // Sequelize espera este nombre exacto por la relación
        });

        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todos los turnos (con info del usuario y servicio)
const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            include: [
                { model: User, attributes: ['name', 'email'] }, // Trae el nombre del usuario
                { model: Service, attributes: ['name', 'price'] } // Trae el nombre del servicio
            ]
        });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createAppointment, getAppointments };