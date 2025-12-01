const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('User', {
    id: {
      type: DataTypes.UUID, // Usamos ID alfanumérico único para seguridad
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
      unique: true, // No puede haber dos usuarios con el mismo email
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'client'), // Solo permite estos dos valores
      defaultValue: 'client',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, { timestamps: false });
};