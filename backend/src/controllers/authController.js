const { User } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTRO DE USUARIO
const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, securityAnswer } = req.body;

        // Validar si ya existe
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        // Crear usuario 
        const newUser = await User.create({
            name,
            email,
            password,
            phone,
            role: role || 'client',
            securityAnswer: securityAnswer || 'peluqueria' // Valor por defecto si no mandan nada
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

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: "Usuario o contraseña incorrectos" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Usuario o contraseña incorrectos" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name }, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
        

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// RECUPERAR CONTRASEÑA
const resetPassword = async (req, res) => {
    try {
        const { email, securityAnswer, newPassword } = req.body;

        // Buscamos al usuario
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        if (!user.securityAnswer) {
             return res.status(400).json({ 
                 error: "Este usuario es antiguo y no tiene pregunta de seguridad configurada. Contacta al admin." 
             });
        }

        // Verificamos la palabra clave
        const validAnswer = await bcrypt.compare(securityAnswer.toLowerCase(), user.securityAnswer);
        
        if (!validAnswer) return res.status(400).json({ error: "Respuesta de seguridad incorrecta" });

        // Encriptamos la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Guardamos
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error(error); // Para ver el error real en la consola
        res.status(500).json({ error: "Error en el servidor al cambiar clave" });
    }
};

// CAMBIAR CONTRASEÑA (Desde Mi Perfil - Logueado)
const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) return res.status(400).json({ error: "La contraseña actual es incorrecta" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login, resetPassword, changePassword };