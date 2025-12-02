const { Order, OrderItem, Product } = require('../db');

const createOrder = async (req, res) => {
    const { userId, items, total } = req.body; 
    // items es un array: [{ productId: 1, quantity: 2, price: 1500 }, ...]

    try {
        // 1. Validar Stock antes de vender nada
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ error: `Sin stock suficiente para: ${product?.name || 'Producto'}` });
            }
        }

        // 2. Crear la Orden (Cabecera)
        const newOrder = await Order.create({
            UserId: userId,
            total: total,
            status: 'completed'
        });

        // 3. Crear los Detalles y RESTAR Stock
        for (const item of items) {
            // Guardamos el detalle
            await OrderItem.create({
                OrderId: newOrder.id,
                ProductId: item.productId,
                quantity: item.quantity,
                price: item.price
            });

            // Restamos del inventario
            const product = await Product.findByPk(item.productId);
            product.stock = product.stock - item.quantity;
            await product.save();
        }

        res.status(201).json({ message: "Compra realizada con éxito", orderId: newOrder.id });

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