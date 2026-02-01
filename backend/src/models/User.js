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
      defaultValue: 'peluqueria' 
    },
    
    notes: {
      type: DataTypes.TEXT, 
      allowNull: true
    }
  }, { timestamps: false });

  // Antes de crear, encriptamos contraseña Y respuesta de seguridad
  User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    
    // Encriptar Password
    user.password = await bcrypt.hash(user.password, salt);
    
    // Encriptar Respuesta de Seguridad (Si existe)
    if (user.securityAnswer) {
        user.securityAnswer = await bcrypt.hash(user.securityAnswer.toLowerCase(), salt);
    }
  });

  return User;
};