const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Service', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT, // Usamos FLOAT para decimales
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // Duración en minutos
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, { timestamps: false });
};