const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs'); 

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'client'),
      defaultValue: 'client',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    securityAnswer: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'peluqueria' // Valor por defecto para no romper usuarios viejos
    }
  }, { timestamps: false });

  // HOOK: Antes de crear, encriptamos contraseña Y respuesta de seguridad
  User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    
    // 1. Encriptar Password
    user.password = await bcrypt.hash(user.password, salt);
    
    // 2. Encriptar Respuesta de Seguridad (Si existe)
    if (user.securityAnswer) {
        // La guardamos en minúsculas para que no importe si escriben "Rex" o "rex"
        user.securityAnswer = await bcrypt.hash(user.securityAnswer.toLowerCase(), salt);
    }
  });

  return User;
};