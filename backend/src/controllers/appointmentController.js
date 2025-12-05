const { Appointment, User, Service } = require('../db');

// Crear un nuevo turno
const createAppointment = async (req, res) => {
    try {
        const { date, time, UserId, ServiceId, clientName } = req.body;

        // 1. Validar datos básicos
        if (!date || !time || !ServiceId) {
            return res.status(400).json({ error: "Faltan datos (fecha, hora o servicio)" });
        }

        // --- INICIO DE VALIDACIONES NUEVAS ---

        const appointmentDate = new Date(`${date}T${time}`); // Creamos objeto Fecha
        const now = new Date();
        const dayOfWeek = appointmentDate.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        const hour = parseInt(time.split(':')[0]); // Extraemos la hora (ej: "14:30" -> 14)

        // Regla A: No permitir fechas pasadas
        if (appointmentDate < now) {
            return res.status(400).json({ error: "Error: fecha ya pasada" });
        }

        // Regla B: Cerrado Domingos (0) y Lunes (1)
        if (dayOfWeek === 0 || dayOfWeek === 1) {
            return res.status(400).json({ error: "Error: La peluquería está cerrada Domingos y Lunes." });
        }

        // Regla C: Horario de 9 a 18 hs
        // (Si la hora es menor a 9 O mayor/igual a 18, rebota)
        if (hour < 9 || hour >= 18) {
            return res.status(400).json({ error: "Error: Horario de atención: 09:00 a 18:00 hs." });
        }

        // --- FIN DE VALIDACIONES NUEVAS ---

        // Validar cliente (registrado o físico)
        if (!UserId && !clientName) {
            return res.status(400).json({ error: "Debes indicar un Usuario registrado o un Nombre de cliente físico" });
        }

        // Crear turno
        const newAppointment = await Appointment.create({
            date,
            time,
            UserId: UserId || null,
            clientName: clientName || null,
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
        const { userId } = req.query; // Buscamos si viene un ?userId=... en la URL

        // Configuramos la consulta base
        let queryOptions = {
            include: [
                { model: User, attributes: ['name', 'email'] },
                { model: Service, attributes: ['name', 'price'] }
            ],
            order: [['date', 'ASC'], ['time', 'ASC']] // De paso, los ordenamos por fecha
        };

        // SI nos enviaron un ID, filtramos. SI NO, traemos todo.
        if (userId) {
            queryOptions.where = { UserId: userId };
        }

        const appointments = await Appointment.findAll(queryOptions);
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// EDITAR TURNO (PUT)
const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time } = req.body; // Solo permitimos cambiar fecha y hora

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.status(404).json({ error: "Turno no encontrado" });

        // --- REPETIMOS LAS VALIDACIONES DE REGLAS DE NEGOCIO ---
        const appointmentDate = new Date(`${date}T${time}`);
        const now = new Date();
        const dayOfWeek = appointmentDate.getDay();
        const hour = parseInt(time.split(':')[0]);

        if (appointmentDate < now) {
            return res.status(400).json({ error: "❌ La fecha ya pasó." });
        }
        if (dayOfWeek === 0 || dayOfWeek === 1) {
            return res.status(400).json({ error: "❌ Cerrado Domingos y Lunes." });
        }
        if (hour < 9 || hour >= 18) {
            return res.status(400).json({ error: "❌ Horario: 09:00 a 18:00 hs." });
        }
        // -------------------------------------------------------

        // Actualizamos
        appointment.date = date;
        appointment.time = time;
        await appointment.save();

        res.json({ message: "Turno actualizado", appointment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createAppointment, getAppointments, updateAppointment };