var fs = require('fs');
var express = require('express');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

var app = express();
var filename, filesize;

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         //console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    //console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
// route handler to load the html for the home page
app.route('/').get(function(req, res) {
      res.sendFile(process.cwd() + '/views/index.html');
    })

// route handler to load the html for the upload page
app.route("/upload").get(function(req, res) {
  res.sendFile(process.cwd() + '/views/upload.html');
});

// route handler to return the filename and file size info as JSON
app.route("/get-file-size").post(upload.single('fccFileUpload'), function(req, res) {
    
  filename = req.file.originalname;
  filesize = req.file.size;
  
  
  // deletes the uploaded file from the ./uploads folder (path and fileanme are in the req.file.path field)
  // I could pass the file to a mongoDB along with these attributes for storage but that wasn't required in this FCC task
  fs.unlink(req.file.path);
  
  // returns the info as JSON
  res.json(
    {
      "filename": filename,
      "file size": filesize
    }
  );
});


    
// Respond not found to all the wrong routes
app.use(function(req, res, next){
      res.json('Page not found');   
  res.status(404);
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})


app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

