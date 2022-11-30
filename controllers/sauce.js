const Sauce = require('../models/Sauce')

exports.getAllSauces = async (req, res) => {
        try {
            const sauces = await Sauce.find() 
            res.status(200).json(sauces)
        }   catch(error) {
            console.log(`Une erreur est survenue : ${error.message}`)
            res.status(500).json({ error })
        }
};


exports.createSauce = async (req, res) => {
    const sauceObject = req.body.sauce

    if(!sauceObject) {
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
        console.log(`Une erreur est survenue : ${error.message}`)
        res.status(400).json({message : 'A field is not valid'})  // because the user goes through the api to add a sauce with a missing element
        return
    }

    delete sauceParsed._id   // Delete the id to later generate a new id for the database
    delete sauceParsed.userId   // Delete the id of the person who created the object

    const sauce = new Sauce({
        ...sauceParsed,
        likes : 0,
        dislikes: 0,
        userId: req.auth.userId,
        imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    
    const userLikedOrDisliked = sauce.usersLiked || sauce.usersDisliked
    if(userLikedOrDisliked.length > 0) {
        return res.status(400).json({message : "UsersLiked and UsersDisliked has to be empty"})
    }

    try {
        await sauce.save()
        res.status(201).json({ message : 'Registered sauce' })
    } catch(error){
        console.log(`Une erreur est survenue : ${error.message}`)
        res.status(400).json({ error }) // If you put a string instead of a number // He can be error : 500
        return
    }

}

exports.modifySauce = async (req, res) => {
    let sauceObject

    if (req.file) {
        try {
            sauceObject = {
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            }
        }
        catch(error){
            console.log(`Une erreur est survenue : ${error.message}`)
            return res.status(400).json({message : "Missing Sauce"})
        }
    }
    else {
        sauceObject = req.body
    }

    const sauceField = !sauceObject.name  || !sauceObject.manufacturer|| !sauceObject.description || !sauceObject.mainPepper || !sauceObject.heat

    if(sauceField) {          
        return res.status(400).json({message : 'Missing Field'}) 
    }

    if(sauceObject.userId != req.auth.userId) {
        return res.status(403).json({message : 'Unauthorized Request'})
    }

    delete sauceObject.userId // to prevent a user from creating an object in their name and then modifying it to assign it to someone else
    
    // To prevent a user from modify like/dislike
    delete sauceObject.usersLiked
    delete sauceObject.usersDisliked
    delete sauceObject.likes
    delete sauceObject.dislikes
    
    try{
        const sauce = await Sauce.findOne({_id: req.params.id})
        if(!sauce) {
            return res.status(404).json({message: "Non-existent sauce"})
        }
        await sauce.updateOne({ _id: req.params.id, ...sauceObject })
        res.status(200).json({message: 'Modified sauce !'})
    } catch(error) {
        console.log(`Une erreur est survenue : ${error.message}`)
        return res.status(400).json({ message : "Non-existent sauce id"})
    }
};

exports.getOneSauce = async (req, res) => {

    try {        
        const sauce = await Sauce.findOne({_id: req.params.id})
        res.status(200).json(sauce)
    }  catch(error) {
        console.log(`Une erreur est survenue : ${error.message}`)
        res.status(400).json({message : 'Non-existent sauce id'})
        return
    }
}

exports.deleteOneSauce = async (req,res) => { 
    let sauce
    
    try {        
        sauce = await Sauce.findOne({_id: req.params.id})
    }  catch(error) {
        console.log(`Une erreur est survenue : ${error.message}`)
        return res.status(404).json({ message : "Non-existent sauce id" })
    }
    
    if (req.auth.userId !== sauce.userId) {
        return res.status(403).json({ message : "Unauthorized"})
    }

    try {        
        await Sauce.deleteOne({ _id: req.params.id })
        return res.status(200).json({message: 'Deleted sauce'})
    }   catch(error) {
        console.log(`Une erreur est survenue : ${error.message}`)
        res.status(400).json({error})
    }
}


exports.likeAndDislike = async (req, res) => {
    const likeStatus = req.body.like
    const userId = req.auth.userId
    const goodLikeStatus = likeStatus === 1 || likeStatus === -1 || likeStatus === 0
    if(!goodLikeStatus) {
        return res.status(400).json({ message : "The like must be a 1 or 0 or -1"})
    }
    
    // If the user like the sauce 

    if(likeStatus === 1) {
        try {
            const sauce = await Sauce.findOne({_id: req.params.id})
            if(sauce.usersLiked.includes(userId)) {
                res.status(403).json({ message : 'Unauthorized'})
                return 
            }
            else if(sauce.usersDisliked.includes(userId)) {
                return res.status(400).json({message : 'You need to decreased your dislike before increased the like'})
            }

            await Sauce.updateOne({ _id: req.params.id }, { $inc:{ likes: +1 }, $push:{ usersLiked: userId }})
            res.status(200).json({message: 'Like has been increased'})
        } catch(error) {
            console.log(`Une erreur est survenue : ${error.message}`)
            res.status(400).json({ message : "Non-existent sauce id"})
        }
    }

    // If the user decides to remove their like or dislike

    else if(likeStatus === 0) {
        try {
            const sauce = await Sauce.findOne({_id: req.params.id})

            if(sauce.usersLiked.includes(userId)) {
                try {
                    await Sauce.updateOne({ _id: req.params.id }, { $inc:{ likes: -1 }, $pull:{ usersLiked: userId }})
                    res.status(200).json({ message: 'Like has been decreased'})
                }   catch(error) {
                    console.log(`Une erreur est survenue : ${error.message}`)
                    res.status(400).json({ error })
                }
            }
            else if(sauce.usersDisliked.includes(userId)) {
                try {
                    await Sauce.updateOne({ _id: req.params.id }, { $inc:{ dislikes: -1 }, $pull: { usersDisliked: userId }})
                    res.status(200).json({ message: 'Dislike has been decreased'})
                }   catch(error) {
                    console.log(`Une erreur est survenue : ${error.message}`)
                    res.status(400).json({ error })
                }
            }   else {
                res.status(400).json({ message: "You have neither liked nor disliked"})
            }
        }
        catch(error) {
            console.log(`Une erreur est survenue : ${error.message}`)
            res.status(400).json({message : "Non-existent sauce id"})
        }
    }

    //If user don't like the sauce  

    else if(likeStatus === -1) {
        try {
            const sauce = await Sauce.findOne({_id: req.params.id})

            if(sauce.usersDisliked.includes(userId)) {
                res.status(403).json({ message : 'Unauthorized'})
                return 
            }
            else if(sauce.usersLiked.includes(userId)) {
                return res.status(400).json({message : 'You need to decreased your like before increased the dislike'})
            }
            await Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: +1}, $push: { usersDisliked: userId}})
            res.status(200).json({ message: 'Dislike has been increased'})
        }   catch(error){
            console.log(`Une erreur est survenue : ${error.message}`)
            res.status(400).json({ message : "Non-existent sauce id"})
        }
    }
}
