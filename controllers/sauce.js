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
    const sauceObject = await req.body.sauce

    if(sauceObject === null || sauceObject === undefined) {
        console.log(sauceObject)
        res.status(400).json({ message : 'Missing sauce' })
        return
    }

    if(req.file === null || req.file === undefined) {
        res.status(400).json({ message : 'Missing image' })
        return
    }

    try {
        const sauceParsed = JSON.parse(sauceObject)

        delete sauceParsed._id   // Delete the id to later generate a new id for the database
        delete sauceParsed._userId   // Delete the id of the person who created the object
        const sauce = new Sauce({
            ...sauceParsed,
            likes : 0,
            dislikes: 0,
            userId: req.auth.userId,
            imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        })

        sauce.save()

        try {
            res.status(201).json({ message : 'Registered sauce' })
        } catch(error){
            console.log(error)
            res.status(400).json({ error })
        }

    } catch(error) {
        console.log(error)
        res.status(400).json({message : 'A field is not valid'})        // because the user goes through the api to add a sauce with a missing element
    }
}

exports.modifySauce = async (req, res) => {
    /*
    const sauceObject = await req.body
    const file = await req.file
    if(file === undefined || file === null) {
        file {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        }
        res.status(400).json({ message : 'Missing image' })
    } else {
        sauceObject
    }
    */
    const sauceObject = await req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }; // retrieves the object if it has already been transmitted

    delete sauceObject.userId // to prevent a user from creating an object in their name and then modifying it to assign it to someone else
    
    const sauce = await Sauce.findOne({_id: req.params.id})

        try {
            if(sauce.userId = req.auth.userId) {
                sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                try {
                    res.status(200).json({message: 'Modified sauce !'})
                }   catch(error) {
                        console.log(error)
                        res.status(400).json({error})
                }
            } else {
                res.status(403).json({message: 'Unauthorized request.'})
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
    const likeStatus = req.body.likes
    const userId = req.body.userId
    
    // If the user like the sauce the like is increase to one
    if(likeStatus === 1) {
        await Sauce.updateOne({ _id: req.params.id }, { $inc:{ likes: +1 }, $push:{ usersLiked: userId } })
        try {
            res.status(200).json({message: 'Like has been increased'})
        } catch {
            console.log(error)
            res.status(400).json({ error })
        }
    }

    // If the user decides to remove their like or dislike
    if(likeStatus === 0) {
        await Sauce.updateOne({ _id: req.params.id }, { $inc:{ likes: -1 }, $pull:{ usersLikes: userId }})
        try {
            res.status(200).json({ message: 'Like has been decreased'})
        }   catch(error) {
            res.status(400).json({ error })
        }

        Sauce.updateOne({ _id: req.params.id }, { $inc:{dislikes: -1 }, $pull: { usersDisliked: userId }})
        try {
            res.status(200).json({ message: 'Dislike has been decreased'})
        }   catch(error) {
            console.log(error)
            res.status(400).json({ error })
        }
    }

    //If user don't like the sauce  
    if(likeStatus === -1) {
        await Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: +1}, $push: { usersDisliked: userId}})
        try {
            res.status(200).json({ message: 'Dislike has been increased'})
        }   catch(error){
            console.log(error)
            res.status(400).json({ error })
        }
    }
}
