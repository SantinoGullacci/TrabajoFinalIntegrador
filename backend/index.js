const app = require('./src/app');
const dotenv = require('dotenv');
const { conn } = require('./src/db');
dotenv.config();

const PORT = process.env.PORT || 3001;

// Sincronizamos la base de datos y luego levantamos el servidor
// force: false significa que NO borre las tablas cada vez que reinicias
conn.sync({ force: false }).then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
});