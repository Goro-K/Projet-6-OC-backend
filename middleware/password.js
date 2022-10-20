const passwordValidator = require('password-validator')

// schema and properties for password
const schemaPassword = new passwordValidator();

schemaPassword

.is().max(20)                                  // Maximum length 20
.has().not().spaces()                           // Should not have spaces


module.exports = (req, res, next ) => {
    if(schemaPassword.validate(req.body.password)) {
        next()
    } else {
        return res.status(400).json({message : `Password cannot have spaces and he must have of maximum length : 20, ${schemaPassword.validate(req.body.password, { list : true })}`})
    }
}