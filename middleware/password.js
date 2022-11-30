const passwordValidator = require('password-validator')

// schema and properties for password
const schemaPassword = new passwordValidator();

schemaPassword

.is().min(4)                                    // Minimum length 4
.has().lowercase()                              // Must have lowercase letters
.is().max(20)                                  // Maximum length 20
.has().not().spaces()                          // Should not have spaces


module.exports = (req, res, next ) => {
    if(schemaPassword.validate(req.body.password)) {
        next()
    } else {
        return res.status(400).json({message : `Password cannot have spaces, he must have maximum length : 20, only lowercase and have minimum length : 4`})
    }
}