const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Product', {
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
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Si no pones nada, arranca en 0
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: { // Agregamos esto por si quieres poner fotos después
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, { timestamps: false });
};