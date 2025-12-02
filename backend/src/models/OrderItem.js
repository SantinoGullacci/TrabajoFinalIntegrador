const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: { // Guardamos el precio histórico por si mañana sube la inflación
      type: DataTypes.FLOAT,
      allowNull: false,
    }
  }, { timestamps: false });
};