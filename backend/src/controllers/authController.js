const { User } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTRO DE USUARIO
const register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Validar si ya existe
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        // Crear usuario (el hook beforeCreate encriptará la password solo)
        const newUser = await User.create({
            name,
            email,
            password,
            phone,
            role: role || 'client' // Por defecto es cliente
        });

        res.status(201).json({ message: "Usuario creado con éxito", userId: newUser.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN DE USUARIO
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar usuario
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: "Usuario o contraseña incorrectos" });
        }

        // 2. Comparar contraseñas (La que viene vs la encriptada)
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Usuario o contraseña incorrectos" });
        }

        // 3. Generar el Token (JWT)
        // Este token lleva adentro el ID y el ROL del usuario
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name }, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // El token dura 1 día
        );

        res.status(200).json({ token, user: { id: user.id, name: user.name, role: user.role } });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login };