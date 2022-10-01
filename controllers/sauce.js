const { json } = require('express');
const auth = require('../middleware/auth');
const Sauce = require('../models/Sauce')

exports.getAllSauce = async (req, res) => {
    const sauces = await Sauce.find()        // allows to find all the objects
        try {
            res.status(200).json(sauces)
        }   catch(error) {
            res.status(400).json({error})
        }
};


exports.createSauce = async (req, res) => {
    const sauceObject = req.body.sauce

    if(!sauceObject) {
        console.log(sauceObject)
        res.status(400).json({ message : 'Missing sauce' })
        return
    }

    if(!req.file) {
        res.status(400).json({ message : 'Missing image' })
        return
    }

    let sauceParsed

    try {
        sauceParsed = JSON.parse(sauceObject)
        
    } catch(error) {
        console.log(error)
        res.status(400).json({message : 'A field is not valid'})        // because the user goes through the api to add a sauce with a missing element
        return
    }

    delete sauceParsed._id   // Delete the id to later generate a new id for the database
    delete sauceParsed._userId   // Delete the id of the person who created the object
    const sauce = new Sauce({
        ...sauceParsed,
        likes : 0,
        dislikes: 0,
        userId: req.auth.userId,
        imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })

    try {
        await sauce.save()
        res.status(201).json({ message : 'Registered sauce' })
    } catch(error){
        console.log(error)
        res.status(400).json({ error })
        return
    }

}

exports.modifySauce = async (req, res) => {
    // Try catch sur le parse et verifier que body n'est pas vide

    let sauceObject 
    if(req.file) {
        if(!re)
        sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        }
    } else {
        sauceObject = req.body
    }
    
/*
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : req.body ; // retrieves the object if it has already been transmitted
*/

    delete sauceObject.userId // to prevent a user from creating an object in their name and then modifying it to assign it to someone else
    
    const sauce = await Sauce.findOne({_id: req.params.id})

    if(!sauce) {
        res.status(404).json({message : 'Missing sauce'})
        return
    }

    if(sauce.userId != req.auth.userId) {
        res.status(403).json({message : 'Unauthorized request.'})
        return
    }

    try {
        await sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        res.status(200).json({message: 'Modified sauce !'})
    } catch(error) {
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
            res.status(403).json({message : 'Unauthorized request.'})
        }
        else {
            await Sauce.deleteOne({ _id: req.params.id })
            try {
                res.status(200).json({message: 'Deleted sauce'})
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


exports.likeAndDislike = async (req, res) => {
    const likeStatus = req.body.like
    const userId = req.body.userId
    console.log("toto")
    // If the user like the sauce the like is increase to one
    if(likeStatus === 1) {
        try {
            await Sauce.updateOne({ _id: req.params.id }, { $inc:{ likes: +1 }, $push:{ usersLiked: userId } })
            res.status(200).json({message: 'Like has been increased'})
        } catch {
            console.log(error)
            res.status(400).json({ error })
        }
    }

    // If the user decides to remove their like or dislike
    else if(likeStatus === 0) {
        try {
            await Sauce.updateOne({ _id: req.params.id }, { $inc:{ likes: -1 }, $pull:{ usersLikes: userId }})
            res.status(200).json({ message: 'Like has been decreased'})
        }   catch(error) {
            res.status(400).json({ error })
        }

        try {
            Sauce.updateOne({ _id: req.params.id }, { $inc:{dislikes: -1 }, $pull: { usersDisliked: userId }})
            res.status(200).json({ message: 'Dislike has been decreased'})
        }   catch(error) {
            console.log(error)
            res.status(400).json({ error })
        }
    }

    //If user don't like the sauce  
    else if(likeStatus === -1) {
        try {
            await Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: +1}, $push: { usersDisliked: userId}})
            res.status(200).json({ message: 'Dislike has been increased'})
        }   catch(error){
            console.log(error)
            res.status(400).json({ error })
        }
    } else {
        res.status(400).json({ message : "numero " })
    }
}
