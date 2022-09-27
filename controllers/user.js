const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// Inscription de l'utilisateur

exports.signup = async (req, res) => {
    const body = req.body;

    if(!(body.email && body.password)) {
        return res.status(400).json({error});
    }

    // crée un nouveau user via la BDD mongoose User
    const user = new User(body);
    // Défini le mdp de l'utilisateur sur un mdp haché
    user.password = await bcrypt.hash(user.password, 10)
    user.save()
    try {
        res.status(201).json({message: 'Utilisateur crée'})
    }   catch(error) {
        console.log(error)
        res.status(400).json({error})
    }

}

// Connexion de l'utilisateur 

exports.login = async (req, res) => {
    const body = req.body;

    const user = await User.findOne({ email: body.email })
    if(user) {
        const validPassword = await bcrypt.compare(body.password, user.password);
        
        if(validPassword) {
            res.status(200).json({ 
                userId: user._id,
                token:  jwt.sign(
                    {userId: user._id},
                    'RANDOM_TOKEN_SECRET',
                    {expiresIn: '24h'}
                )
            })
        } else {
            res.status(401).json({ message : 'Paire identifiant/mot de passe incorrecte' })
        }
    } else {
        res.status(401).json({ message : 'Paire identifiant/mot de passe incorrecte' })
    }
}