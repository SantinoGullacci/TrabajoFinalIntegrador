const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Appointment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATEONLY, // Formato AAAA-MM-DD
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME, // Formato HH:MM:SS
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
      defaultValue: 'pending',
    }
  }, { timestamps: true }); // timestamps: true agrega "createdAt" y "updatedAt" automáticamente
};