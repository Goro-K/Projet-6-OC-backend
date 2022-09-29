const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// User registration

exports.signup = async (req, res) => {
    const body = req.body;

    if(!(body.email && body.password)) {
        return res.status(400).json({error});
    }

    // creates a new user via the database mongoose
    const user = new User(body);
    // Sets the user's password to a hashed password
    user.password = await bcrypt.hash(user.password, 10)
    user.save()
    try {
        res.status(201).json({message: 'User created'})
    }   catch(error) {
        console.log(error)
        res.status(400).json({error})
    }

}

// User login 

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
            res.status(401).json({ message : 'Incorrect username/password pair' })
        }
    } else {
        res.status(401).json({ message : 'Incorrect username/password pair' })
    }
}