const { Router } = require('express');
const { createUser, getUsers } = require('../controllers/userController');
const { createAppointment, getAppointments } = require('../controllers/appointmentController');
const { Service } = require('../db'); // Importamos el modelo directo para crear un servicio rápido

const router = Router();

// --- RUTAS DE USUARIOS ---
router.post('/users', createUser);
router.get('/users', getUsers);

// --- RUTAS DE SERVICIOS (Helper rápido) ---
router.post('/services', async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/services', async (req, res) => {
    const services = await Service.findAll();
    res.json(services);
});

// --- RUTAS DE TURNOS ---
router.post('/appointments', createAppointment);
router.get('/appointments', getAppointments);

module.exports = router;