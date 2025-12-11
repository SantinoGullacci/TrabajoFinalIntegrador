const { User } = require('../db');

// PUT /users/:id
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, avatar, role } = req.body; // <--- AGREGAR role

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (avatar) user.avatar = avatar;
        if (role) user.role = role; // <--- PERMITIR CAMBIO DE ROL

        await user.save();
        res.json({ message: "Usuario actualizado", user });
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

// ELIMINAR USUARIO
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Buscamos al usuario
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        // 2. Lo eliminamos
        await user.destroy();

        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        // Si falla (ej: tiene turnos asociados y la DB protege los datos), avisamos
        res.status(500).json({ error: "No se pudo eliminar. Puede que tenga turnos o ventas asociadas." });
    }
};

module.exports = { createUser, getUsers, updateUser, deleteUser };