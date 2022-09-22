const express = require('express');
const authorization = require('../middleware/auth')
const sauceCtrl = require('../controllers/sauce')
const router = express.Router()
const multer = require('../middleware/multer-config');

// Renvoie un tableau de toutes les sauces de la base de données

router
    .get('/', authorization, sauceCtrl.getAllSauce)
    .get('/:id', authorization, sauceCtrl.getOneSauce)
    .post('/', authorization, multer, sauceCtrl.createSauce)

module.exports = router;

