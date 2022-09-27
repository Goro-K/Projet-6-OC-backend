const auth = require('../middleware/auth');
const Sauce = require('../models/Sauce')

exports.getAllSauce = async (req, res) => {
    const sauces = await Sauce.find()        // permet de retrouver tout les objets
        try {
            res.status(200).json(sauces)
        }   catch(error) {
            res.status(400).json({error})
        }
};


exports.createSauce = async (req, res) => {
    const sauceObject = await req.body.sauce

    if(sauceObject === null || sauceObject === undefined) {
        console.log(sauceObject)
        res.status(400).json({ message : 'sauce manquante' })
        return
    }

    if(req.file === null || req.file === undefined) {
        res.status(400).json({ message : 'image manquante' })
        return
    }

    try {
        const sauceParsed = JSON.parse(sauceObject)

        delete sauceParsed._id   // supprime l'id pour plus tard généré un nouvel id de la base de donnée
        delete sauceParsed._userId   // Supprime l'id de la personne qui à crée l'objet
        const sauce = new Sauce({
            ...sauceParsed,
            likes : 0,
            dislikes: 0,
            userId: req.auth.userId,
            imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        })

        sauce.save()

        try {
            res.status(201).json({ message : 'Sauce enregistré' })
        } catch(error){
            console.log(error)
            res.status(400).json({ error })
        }

    } catch(error) {
        console.log(error)
        res.status(400).json({message : 'Un champ est invalide'})        // car l'user passe par l'api pour ajouté une sauce avec un element manquant
    }
}

exports.modifySauce = async (req, res) => {
    const sauceObject = await req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }; // recupere l'objet s'il a déjà été transmis

    delete sauceObject.userId // pour eviter qu'un user crée un objet à son nom puis le modifie pour l'assigner à quelqu'un d'autre
    
    const sauce = await Sauce.findOne({_id: req.params.id})
        try {
            if(sauce.userId = req.auth.userId) {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                try {
                    res.status(200).json({message: 'Sauce modifié !'})
                }   catch(error) {
                        console.log(error)
                        res.status(400).json({error})
                }
            } else {
                res.status(403).json({message: 'Non-Autorisé'})
            }
        }   catch(error) {
            console.log(error)
            res.status(400).json({error})
        }
};

exports.getOneSauce = async (req, res) => {
    const sauce = await Sauce.findOne({ _id: req.params.id})
    try {
        res.status(200).json(sauce)
    } catch (error) {
        console.log(error)
        res.status(404).json({error})
    }
}

exports.deleteOneSauce = async (req,res) => {
    const sauce = await Sauce.findOne({ _id: req.params.id })
    try {
        if(sauce.userId != req.auth.userId) {
            res.status(403).json({message : 'Non-autorisé'})
        }
        else {
            await Sauce.deleteOne({ _id: req.params.id })
            try {
                res.status(200).json({message: 'Sauce supprimé'})
            }   catch(error) {
                console.log(error)
                res.status(400).json(error)
            }
        }
    }   catch(error) {
        console.log(error)
        res.status(400).json({error})
    }
}

/*
exports.deleteAllSauce =  (req, res) => {
    Sauce.deleteMany()
        .then(() => { res.status(200).json({message : 'Objet supprimé'})})
        .catch(error => res.status(401).json({error}))
};
*/


exports.likeSauce = async (req, res) => {

}