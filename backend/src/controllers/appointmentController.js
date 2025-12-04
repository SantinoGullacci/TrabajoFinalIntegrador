const { Appointment, User, Service } = require('../db');

// Crear un nuevo turno
const createAppointment = async (req, res) => {
    try {
        // Recibimos userId O clientName
        const { date, time, UserId, ServiceId, clientName } = req.body;

        // Validamos que haya fecha, hora y servicio
        if (!date || !time || !ServiceId) {
            return res.status(400).json({ error: "Faltan datos (fecha, hora o servicio)" });
        }

        // Validamos que haya AL MENOS UN cliente (Registrado o Físico)
        if (!UserId && !clientName) {
            return res.status(400).json({ error: "Debes indicar un Usuario registrado o un Nombre de cliente físico" });
        }

        // Creamos el turno
        const newAppointment = await Appointment.create({
            date,
            time,
            UserId: UserId || null,       // Si no hay ID, mandamos null
            clientName: clientName || null, // Si no hay nombre físico, mandamos null
            ServiceId
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