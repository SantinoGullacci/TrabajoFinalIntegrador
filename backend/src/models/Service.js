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
      type: DataTypes.FLOAT, 
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      defaultValue: 30
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, { timestamps: false });
};