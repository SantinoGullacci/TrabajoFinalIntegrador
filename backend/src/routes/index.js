const { Router } = require('express');
// 1. AQUÍ ESTABA EL ERROR PRINCIPAL: Faltaban User, Order y OrderItem
const { User, Service, Product, Order, OrderItem, BusinessInfo } = require('../db'); 

// Controllers
const { getUsers, updateUser, deleteUser } = require('../controllers/userController'); 
const { createAppointment, getAppointments, updateAppointment } = require('../controllers/appointmentController');
const { register, login, resetPassword, changePassword } = require('../controllers/authController');
const { getProducts, createProduct, deleteProduct } = require('../controllers/productController');
const { getOrdersByUser } = require('../controllers/orderController');
const { getAdminStats } = require('../controllers/statsController');

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

// --- RUTAS DE ORDENES (VENTAS) ---
router.post('/orders', async (req, res) => {
  const { total, items, clientName, userId } = req.body; 

  try {
    // Verificar stock
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ error: `Sin stock suficiente para ${product ? product.name : 'producto'}` });
      }
    }

    // Crear la orden vinculada al Usuario (Si userId existe)
    const newOrder = await Order.create({
      total,
      date: new Date(),
      status: 'completed',
      clientName: clientName, 
      UserId: userId || null 
    });

    // Crear items y descontar stock
    for (const item of items) {
      await OrderItem.create({
        OrderId: newOrder.id,
        ProductId: item.productId,
        quantity: item.quantity,
        price: item.price
      });

      const product = await Product.findByPk(item.productId);
      await product.decrement('stock', { by: item.quantity });
    }

    res.status(200).json({ message: "Venta registrada con éxito", order: newOrder });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar la venta" });
  }
});

// --- HISTORIAL DE ORDENES ---
// 2. CORREGIDO: Cambié '/' por '/orders' para que coincida con el Frontend
router.get('/orders', async (req, res) => {
  const { userId } = req.query; 

  try {
    const whereCondition = userId ? { UserId: userId } : {};

    const orders = await Order.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      include: [
        { 
          model: User, 
          attributes: ['name', 'email'] 
        }, 
        { 
          model: OrderItem, 
          include: [{ model: Product, attributes: ['name'] }] 
        }
      ]
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

// --- RUTAS DE REPORTES ---
router.get('/reports/stats', getAdminStats);

// --- INFO DEL NEGOCIO ---
router.get('/businessInfo', async (req, res) => {
  try {
    let info = await BusinessInfo.findOne();
    if (!info) {
      info = await BusinessInfo.create({
        name: "Mara Cabo Estilista",
        description: "Estilista Profesional",
        phone: "+54 9 291 422-1908",
        hours: "Mar a Sab: 09:00 - 18:00 hs",
        address: "Rivadavia 1537"
      });
    }
    res.json(info);
  } catch (error) {
    res.status(500).send("Error al obtener info del negocio");
  }
});

router.put('/businessInfo', async (req, res) => {
  try {
    const { name, description, phone, hours, address } = req.body;
    let info = await BusinessInfo.findOne();
    if (info) {
      await info.update({ name, description, phone, hours, address });
      res.json(info);
    } else {
      const newInfo = await BusinessInfo.create(req.body);
      res.json(newInfo);
    }
  } catch (error) {
    res.status(500).send("Error al guardar info");
  }
});

module.exports = router;