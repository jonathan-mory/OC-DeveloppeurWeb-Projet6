require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const bookRoutes = require('./routes/books');
const authRoutes = require('./routes/auth');

const app = express();

const uri = process.env.MONGO_URI;

mongoose
    .connect(uri)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;
