const { Appointment, User, Service } = require('../db');

// Crear un nuevo turno
const createAppointment = async (req, res) => {
    try {
        const { date, time, UserId, ServiceId, clientName } = req.body;

        // Validar datos básicos
        if (!date || !time || !ServiceId) {
            return res.status(400).json({ error: "Faltan datos (fecha, hora o servicio)" });
        }

        const appointmentDate = new Date(`${date}T${time}`); // Creamos objeto Fecha
        const now = new Date();
        const dayOfWeek = appointmentDate.getDay(); 
        const hour = parseInt(time.split(':')[0]); 

        // No permitir fechas pasadas
        if (appointmentDate < now) {
            return res.status(400).json({ error: "Error: fecha ya pasada" });
        }

        // Cerrado Domingos y Lunes 
        if (dayOfWeek === 0 || dayOfWeek === 1) {
            return res.status(400).json({ error: "Error: La peluquería está cerrada Domingos y Lunes." });
        }

        // Horario de 9 a 18 hs
        if (hour < 9 || hour >= 18) {
            return res.status(400).json({ error: "Error: Horario de atención: 09:00 a 18:00 hs." });
        }

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
                { model: Service, attributes: ['name', 'price', 'duration'] }
            ],
            order: [['date', 'ASC'], ['time', 'ASC']] // los ordenamos por fecha
        };

        if (userId) {
            queryOptions.where = { UserId: userId };
        }

        const appointments = await Appointment.findAll(queryOptions);
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        // Recibimos 'requestingRole' desde el front para saber quién pide cancelar
        const { date, time, status, requestingRole } = req.body; 

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.status(404).json({ error: "Turno no encontrado" });

        if (status === 'cancelled') {
            // Calculamos la fecha del turno
            const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
            const now = new Date();
            
            // Calculamos la diferencia en horas
            const diffInMs = appointmentDate - now;
            const diffInHours = diffInMs / (1000 * 60 * 60);

            // Si falta menos de 24hs Y NO ES ADMIN, error.
            if (diffInHours < 24 && requestingRole !== 'admin') {
                return res.status(400).json({ error: "❌ Los clientes solo pueden cancelar con 24hs de anticipación." });
            }

            appointment.status = 'cancelled';
            await appointment.save();
            return res.json({ message: "Turno cancelado correctamente", appointment });
        }
        
        // --- LÓGICA DE COMPLETAR (COBRAR) ---
        if (status === 'completed') {
            appointment.status = status;
            await appointment.save();
            return res.json({ message: "Estado actualizado", appointment });
        }

        // --- VALIDACIONES DE EDICIÓN DE FECHA ---
        if (date || time) {
            const newDate = date || appointment.date;
            const newTime = time || appointment.time;

            const appointmentDate = new Date(`${newDate}T${newTime}`);
            const now = new Date();
            const dayOfWeek = appointmentDate.getDay();
            const hour = parseInt(newTime.split(':')[0]);

            if (appointmentDate < now) return res.status(400).json({ error: "❌ La fecha ya pasó." });
            if (dayOfWeek === 0 || dayOfWeek === 1) return res.status(400).json({ error: "❌ Cerrado Domingos y Lunes." });
            if (hour < 9 || hour >= 18) return res.status(400).json({ error: "❌ Horario: 09:00 a 18:00 hs." });

            appointment.date = newDate;
            appointment.time = newTime;
        }

        await appointment.save();
        res.json({ message: "Turno actualizado", appointment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createAppointment, getAppointments, updateAppointment };