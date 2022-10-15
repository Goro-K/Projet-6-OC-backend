const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
  };


const storage= multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype]
    /*  if(!extension) {
            res.status(400).json({message : "Please upload a file type of jpeg or png"})
        }
    */
        callback(null, name + Date.now() + "." + extension);
    }
})


const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        if(MIME_TYPES[file.mimetype]) {
            callback(null, true)
        } else {
           return callback(new Error('Please upload a file type of jpeg or png'))
        }
    }
});



module.exports = upload.single('image')