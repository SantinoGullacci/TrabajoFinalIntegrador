const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./routes/index'); 

const app = express(); // Aquí definiste 'app'

app.name = 'API';

// --- 1. MIDDLEWARES (Configuración) ---

// IMPORTANTE: El CORS va primero, antes que las rutas.
app.use(cors({
  origin: [
    'http://localhost:5173',                         // Tu local
    'https://trabajo-final-integrador-pi.vercel.app' // Tu Vercel (SIN barra al final)
  ],
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());

// --- 2. RUTAS ---
app.use('/', routes); 

module.exports = app;