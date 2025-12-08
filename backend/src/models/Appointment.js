const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Appointment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      // AQUÍ ESTABA EL ERROR: Faltaba agregar 'completed' a la lista
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'), 
      defaultValue: 'pending',
    },
    clientName: { 
      type: DataTypes.STRING,
      allowNull: true, 
    }
  }, { timestamps: true });
};