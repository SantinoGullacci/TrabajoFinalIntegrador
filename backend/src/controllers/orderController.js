const { Order, OrderItem, Product } = require('../db');

const createOrder = async (req, res) => {
    // Recibimos userId O clientName
    const { userId, clientName, items, total } = req.body; 

    try {
        // Validar Stock
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ error: `Sin stock suficiente para: ${product?.name}` });
            }
        }

        // Crear la Orden 
        const newOrder = await Order.create({
            UserId: userId || null,         // Si es null, Sequelize lo deja pasar
            clientName: clientName || null, // Guardamos el nombre del físico
            total: total,
            status: 'completed'
        });

        // Crear Detalles y RESTAR Stock
        for (const item of items) {
            await OrderItem.create({
                OrderId: newOrder.id,
                ProductId: item.productId,
                quantity: item.quantity,
                price: item.price
            });

            const product = await Product.findByPk(item.productId);
            product.stock = product.stock - item.quantity;
            await product.save();
        }

        res.status(201).json({ message: "Compra realizada", orderId: newOrder.id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al procesar la compra" });
    }
};

const getOrdersByUser = async (req, res) => {
    const { userId } = req.params;
    const orders = await Order.findAll({
        where: { UserId: userId },
        include: [{ model: OrderItem, include: [Product] }] // Trae la orden con sus items y los nombres de productos
    });
    res.json(orders);
};

module.exports = { createOrder, getOrdersByUser };