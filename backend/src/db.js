require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const { DATABASE_URL } = process.env;

const sequelize = new Sequelize(DATABASE_URL, {
    logging: false,
    native: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

const basename = path.basename(__filename);
const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));

// Capitalizamos los nombres de los modelos
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// --- ZONA DE RELACIONES ---
// Obtenemos los modelos (UNA SOLA VEZ)
const { User, Service, Appointment } = sequelize.models;

// Definimos las relaciones
// Un Usuario puede tener muchos turnos
User.hasMany(Appointment);
Appointment.belongsTo(User);

// Un Servicio puede estar en muchos turnos
Service.hasMany(Appointment);
Appointment.belongsTo(Service);

module.exports = {
  ...sequelize.models,
  conn: sequelize,
};