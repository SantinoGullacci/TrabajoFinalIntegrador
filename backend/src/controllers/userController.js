const { User } = require('../db');

// PUT /users/:id
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, phone, role, notes } = req.body; 

    try {
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        //  Actualizamos el usuario con los datos nuevos
        await user.update({ 
            name: name || user.name, 
            phone: phone || user.phone, 
            role: role || user.role,
            notes: notes !== undefined ? notes : user.notes // Actualizamos notas si vienen
        });

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
        
        // Buscamos al usuario
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        // Lo eliminamos
        await user.destroy();

        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        // Si falla avisamos
        res.status(500).json({ error: "No se pudo eliminar. Puede que tenga turnos o ventas asociadas." });
    }
};

module.exports = { createUser, getUsers, updateUser, deleteUser };