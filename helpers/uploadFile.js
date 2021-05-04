const multer = require('multer');
const fs = require('fs');
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // console.log(req.query.documentId);
    const path = `images/${req.query.documentId}`;
    fs.mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
}).single('image');
