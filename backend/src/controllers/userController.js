const { User } = require('../db');

const createUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validamos que lleguen los datos obligatorios
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        // Creamos el usuario en la BD
        const newUser = await User.create({
            name,
            email,
            password,
            phone
        });

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createUser, getUsers };