const Sauce = require('../models/Sauce')

exports.getAllSauce = (req, res) => {
    Sauce.find()        // permet de retrouver tout les objets
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};


exports.getOneSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce=> res.status(200).json(sauce))
        .catch(error => res.status(404).json({error}))
}

exports.createSauce = (req, res) => {
    const thingSauce = JSON.parse(req.body.sauce)
    delete thingSauce._id   // supprime l'id pour plus tard généré un nouvel id de la base de donnée
    delete thingSauce._userId   // Supprime l'id de la personne qui à crée l'objet
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...thingSauce,
        userId: req.auth.userId,
        image : `${req.protocol}://${req.get('host')}/file-upload/${req.file.filename}`
    })

    sauce.save()
        .then(() => res.status(201).json({message : 'Image enregistré'}))
        .catch(error => res.status(400).json({ error }))
}