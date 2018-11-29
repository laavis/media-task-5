const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const app = express();

require('dotenv').config();

const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });

app.use(express.static('public'));
app.use('/modules', express.static('node_modules'));

const db = require('./modules/database');
const connection = db.connect();
const resize = require('./modules/resize');

const credentials = {
  key: fs.readFileSync(__dirname + '/cert/key.pem'),
  cert: fs.readFileSync(__dirname + '/cert/cert.pem')
};

const cb = (result, res) => {
  console.log(result);
  res.send(result);
};

app.use((req, res, next) => {
  if (req.secure) return next();
  return res.redirect(`https://${req.headers.host}${req.url}`);
});

// respond to post and save file
app.post('/upload', upload.single('mediafile'), (req, res, next) => {
  next();
});

// create thumbnail
app.use('/upload', (req, res, next) => {
  resize.doResize(
    req.file.path, 300,
    './public/thumbs/' + req.file.filename + '_thumb',
    next
  );
});

// create medium image
app.use('/upload', (req, res, next) => {
  resize.doResize(
    req.file.path, 640,
    './public/medium/' + req.file.filename + '_medium',
    next
  );
});

// Get coordinates
app.use('/upload', (req, res, next) => {
  const data = [
    req.body.category,
    req.body.title,
    req.body.details,
    req.file.filename + '_thumb',
    req.file.filename + '_medium',
    req.file.filename
  ];
  db.insert(data, connection, next);
});

app.get('/list', (req, res, next) => {
  db.select(connection, cb, res);
});

// Get updated data from database and send to client
app.use('/upload', (req, res, next) => {
  res.redirect('/');
});


const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80);
httpsServer.listen(443, () => console.log(`HTTPS server running`));
