const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const TOKEN = process.env.TOKEN

// User registration

exports.signup = async (req, res) => {
    const body = req.body;
    const regexMail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)+$/
    const regexPassword = /^\w+[\.-]?\w+$/

    if(!regexPassword.test(body.password)) {
        return res.status(400).json({message : "Incorrect password"})
    }
    if(!regexMail.test(body.email)) {
        return res.status(400).json({message : "Incorrect email"})
    } 

    if(!(body.email && body.password)) {
        return res.status(400).json({message : "Incorrect username or password"});
    }


    // creates a new user via the database mongoose
    const user = new User(body);
    // Sets the user's password to a hashed password
    try {
        user.password = await bcrypt.hash(user.password, 10)
    } catch(error) {
        console.log(error)
        res.status(400).json({ error })
    }


    try {
        await user.save()
        res.status(201).json({message: 'User created'})
    }   catch(error) {
        console.log(error)
        res.status(500).json({error})
    }

}

// User login 

exports.login = async (req, res) => {
    const body = req.body;

    let user 
    try {
        user = await User.findOne({ email: body.email })
    } catch(error) {
        console.log(error)
        return res.status(400).json({message : "User introuvable"})
    }

    if(user) {
        const validPassword = await bcrypt.compare(body.password, user.password);
        
        if(validPassword) {
            res.status(200).json({ 
                userId: user._id,
                token:  jwt.sign(
                    {userId: user._id},
                    TOKEN,
                    {expiresIn: '24h'}
                )
            })
        } else {
            res.status(401).json({ message : 'Incorrect username/password pair' })
        }
    } else {
        res.status(401).json({ message : 'Incorrect username/password pair' })
    }
}