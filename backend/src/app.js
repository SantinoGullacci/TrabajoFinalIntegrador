const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./routes/index'); 

const app = express(); 

app.name = 'API';

// --- MIDDLEWARES  ---

app.use(cors({
  origin: [
    'http://localhost:5173',                         // local
    'https://trabajo-final-integrador-pi.vercel.app' // Vercel
  ],
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());

// --- RUTAS ---
app.use('/', routes); 

module.exports = app;