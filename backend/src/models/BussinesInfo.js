const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('BusinessInfo', {
    // No hace falta definir ID, Sequelize lo crea solo
    name: {
      type: DataTypes.STRING,
      defaultValue: "Nombre de tu Barbería",
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT, // TEXT permite textos largos
      defaultValue: "Descripción por defecto...",
    },
    phone: {
      type: DataTypes.STRING,
      defaultValue: "+54 9 ...",
    },
    hours: {
      type: DataTypes.STRING,
      defaultValue: "Lun a Vie: 09:00 - 18:00",
    },
    address: {
      type: DataTypes.STRING,
      defaultValue: "Dirección del local",
    }
  }, {
    timestamps: false // No necesitamos fecha de creación/edición para esto
  });
};