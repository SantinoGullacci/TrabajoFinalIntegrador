const { Router } = require('express');
const { getUsers } = require('../controllers/userController');
const { createAppointment, getAppointments } = require('../controllers/appointmentController');
const { Service } = require('../db');
const { register, login } = require('../controllers/authController');
const { getProducts, createProduct, deleteProduct, updateStock } = require('../controllers/productController');
const { createOrder, getOrdersByUser } = require('../controllers/orderController');

const router = Router();

// --- RUTAS DE AUTH ---
router.post('/register', register); // Para crear cuenta
router.post('/login', login);       // Para ingresar

// --- RESTO DE RUTAS ---
router.get('/users', getUsers);

router.post('/services', async (req, res) => {
    const service = await Service.create(req.body);
    res.status(201).json(service);
});
router.get('/services', async (req, res) => {
    const services = await Service.findAll();
    res.json(services);
});

// RUTA NUEVA: Eliminar servicio
router.delete('/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Service.destroy({ where: { id } });
        
        if (result === 0) return res.status(404).json({ message: "Servicio no encontrado" });
        
        res.json({ message: "Servicio eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/appointments', createAppointment);
router.get('/appointments', getAppointments);

// --- RUTAS DE PRODUCTOS ---
router.get('/products', getProducts);
router.post('/products', createProduct);
router.delete('/products/:id', deleteProduct);
router.put('/products/:id', updateStock); // Para editar stock

router.post('/orders', createOrder); // Crear compra
router.get('/orders/:userId', getOrdersByUser); // Ver mis compras

module.exports = router;