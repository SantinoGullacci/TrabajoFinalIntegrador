const { Router } = require('express');
// IMPORTANTE: Aquí estaba el error, getUsers solo debe aparecer una vez en esta línea
const { getUsers, updateUser } = require('../controllers/userController'); 
const { createAppointment, getAppointments, updateAppointment } = require('../controllers/appointmentController');
const { Service, Product } = require('../db'); 
const { register, login, resetPassword, changePassword } = require('../controllers/authController');
const { getProducts, createProduct, deleteProduct } = require('../controllers/productController');
const { createOrder, getOrdersByUser } = require('../controllers/orderController');
const { getAdminStats } = require('../controllers/statsController');
const { deleteUser } = require('../controllers/userController');


const router = Router();

// --- RUTAS DE AUTH ---
router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.put('/auth/change-password/:id', changePassword); 

// --- RUTAS DE USUARIOS ---
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// --- RUTAS DE SERVICIOS ---
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

router.put('/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, duration } = req.body;
        const service = await Service.findByPk(id);

        if (!service) return res.status(404).json({ message: "Servicio no encontrado" });

        service.name = name;
        service.price = price;
        service.duration = duration;
        await service.save();

        res.json({ message: "Servicio actualizado correctamente", service });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

// --- RUTAS DE TURNOS ---
router.post('/appointments', createAppointment);
router.get('/appointments', getAppointments);
router.put('/appointments/:id', updateAppointment);


// --- RUTAS DE PRODUCTOS ---
router.get('/products', getProducts);
router.post('/products', createProduct);
router.delete('/products/:id', deleteProduct);

// Actualizar Producto
router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, stock, imageUrl, category, brand } = req.body;

        const product = await Product.findByPk(id);

        if (!product) return res.status(404).json({ message: "Producto no encontrado" });

        product.name = name;
        product.price = price;
        product.stock = stock;
        product.imageUrl = imageUrl;
        product.category = category;
        product.brand = brand; 

        await product.save();

        res.json({ message: "Producto actualizado", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// --- RUTAS DE ORDENES ---
router.post('/orders', createOrder);
router.get('/orders/:userId', getOrdersByUser);

// --- RUTAS DE REPORTES ---
router.get('/reports/stats', getAdminStats);

module.exports = router;