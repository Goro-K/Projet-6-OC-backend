const express = require('express');
const authorization = require('../middleware/auth')
const sauceCtrl = require('../controllers/sauce')
const router = express.Router()
const multer = require('../middleware/multer-config');


router
    .get('/', authorization, sauceCtrl.getAllSauces)
    .post('/', authorization, multer, sauceCtrl.createSauce)
    .get('/:id', authorization, sauceCtrl.getOneSauce)
    .put('/:id', authorization, multer, sauceCtrl.modifySauce)
    .delete('/:id', authorization, sauceCtrl.deleteOneSauce)
    .post('/:id/like', authorization, sauceCtrl.likeAndDislike)
    
module.exports = router;

