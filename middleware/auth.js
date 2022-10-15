const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const TOKEN = process.env.TOKEN

module.exports = (req,res, next) => {
    try {
        const token = (req.headers.authorization || undefined).split(' ')[1] 
        const decodedToken = jwt.verify(token, TOKEN);
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    } catch(error) {
        console.log(error)
        res.status(403).json({ message : 'unauthorized request' })
    }
}