const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// Mongo URI
const mongoURI = 'mongodb+srv://oussema:ouss123@cluster0-4zuba.mongodb.net/test?retryWrites=true&w=majority';
const promise = mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
const conn = mongoose.connection;

// Init gfs
let gfs;
conn.once('open', () => {
    // Init stream
    gfs = Grid(conn, mongoose.mongo);
    gfs.collection('uploads');
    console.log("connection made successfully");
});



// Create storage engine
const storage = new GridFsStorage({
    db: promise,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });

// @route GET /
// @desc Loads form
app.get('/', (req, res) => {
    res.render('index');
});

// @route POST /upload
// @desc  Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) => {
    //res.json({ file: req.file.filename}); 
    console.log(req.body);
    res.redirect('/');
});

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));