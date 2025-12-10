const { User } = require('../db');

// ACTUALIZAR DATOS DE USUARIO
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone } = req.body; // Solo dejamos cambiar nombre y teléfono por ahora

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        user.name = name || user.name;
        user.phone = phone || user.phone;
        
        await user.save();

        res.json({ message: "Perfil actualizado correctamente", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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

module.exports = { createUser, getUsers, updateUser };