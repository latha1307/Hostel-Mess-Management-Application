const multer = require('multer');
const path = require('path');
const checkFileType = require('../utils/checkFileType')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/new_students/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).fields([
    { name: 'fees_receipt', maxCount: 1 },
    { name: 'student_photo', maxCount: 1 }
]);


module.exports = upload;