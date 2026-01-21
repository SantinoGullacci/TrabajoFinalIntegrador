const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./routes/index'); // <--- 1. Importamos las rutas

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/', routes); // <--- 2. Le decimos al server que use nuestras rutas

server.use(cors({
  origin: [
    'http://localhost:5173',               // Para que te ande en tu casa
    'https://trabajo-final-integrador-pi.vercel.app/'    // <-- LA URL QUE TE DIO VERCEL
  ],
  credentials: true
}));

module.exports = app;