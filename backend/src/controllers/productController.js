const { Product } = require('../db');

// Obtener catálogo
const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear producto (Solo Admin)
const createProduct = async (req, res) => {
    try {
        const { name, price, stock, description, imageUrl, category, brand } = req.body;
        if (!name || !price) return res.status(400).json({ error: "Falta nombre o precio" });

        const newProduct = await Product.create({ 
            name, price, stock, description, imageUrl, category, brand 
        });
        res.status(201).json(newProduct);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
};

// Borrar producto
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.destroy({ where: { id } });
        res.json({ message: "Producto eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar Stock (Para cuando vendamos)
const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body; // Cantidad a restar
        const product = await Product.findByPk(id);
        
        if (!product) return res.status(404).json({ error: "Producto no encontrado" });
        
        product.stock = quantity; // Actualizamos el stock
        await product.save();
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getProducts, createProduct, deleteProduct, updateStock };