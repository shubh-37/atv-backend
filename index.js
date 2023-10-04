const express = require('express');
const app = express();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: './uploads', // Directory where uploaded files will be stored
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name for the stored file
    },
  });
  export const upload = multer({ storage });
app.get('/', ((req,res) => {
    res.send('Hello world');
}));

app.listen(3001, () => {
    console.log("Server is listening on port:3001");
});