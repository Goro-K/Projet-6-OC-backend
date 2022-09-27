const express = require('express');
const app = express();
const mongoose = require('mongoose');
const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
const path = require('path')
const dotenv = require('dotenv')
dotenv.config

const MONGODB_USERNAME = process.env.MONGO_USERNAME
const MONGODB_PASSWORD = process.env.MONGO_PASSWORD

mongoose.connect(`mongodb+srv://RomanK:5YdSv4UxJ2M2DRNB@cluster0.4qekfkx.mongodb.net/?retryWrites=true&w=majority`, 
    {useNewUrlParser: true, 
    useUnifiedTopology: true })
    try {
        console.log('Connexion à MongoDB réussie !')
    }   catch {
        console.log('Connexion à MongoDB échouée !')
    }


app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next()
});

app.use(express.json()) // allow JSON data

app.use('/api/sauces', sauceRoutes)
app.use('/api/auth', userRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')))    //

module.exports = app;