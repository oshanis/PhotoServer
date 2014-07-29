// web.js
var express = require("express"),
	  app = express(),
    http = require('http'),
    path = require('path'),
    routes = require('./routes'),
	  logfmt = require("logfmt"),
    formidable = require('formidable'),
    util = require('util')
    fs   = require('fs'),
    qt   = require('quickthumb'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    randomstring = require("randomstring"),
    config = require('./config');


var GOOGLE_CLIENT_ID = config.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET = config.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL = config.GOOGLE_CALLBACK_URL,
    server_url = config.server_url;

var brand = config.brand;


// Database Settings
var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
 'mongodb://localhost:27017/exampleDb';

//Database docs
var collection;
var user_collection;
var photo_collection;
var provenance_collection;


// Connect to the db
module.exports = MongoClient.connect(mongoUri, function(err, db) {
    if(err) { return console.dir(err); }

    collection = db.collection('test');
    var docs = [{mykey:1}, {mykey:2}, {mykey:3}];
    collection.insert(docs, {w:1}, function(err, result) {});

    //Instantiate the users table to store their data
    user_collection = db.collection('users');
    photo_collection = db.collection('photos');
});



//Setting the usage restrictions for the images served from this website
//Make sure to call next() only when the call to the db is complete
//Otherwise no usage_restrictions will be set on the request
app.use(function(req, res, next) {
  var matchUrl = '/';
  console.log(mongoUri);
  if(req.url.substring(0, matchUrl.length) === matchUrl) {
    photo_collection.findOne({"_id":server_url+req.url}, function(err, item) {
       if (item){
        res.setHeader("Usage-Restrictions", item.usage_restrictions);
       }
       return next();
    });

  }

});


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));


app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


app.use(logfmt.requestLogger());
app.use(qt.static(__dirname + '/')); // Use quickthumb
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser({uploadDir:'./uploads'}));
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));



app.get('/', routes.index);

app.get('/account', ensureAuthenticated, routes.account);


// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email'] }),
  function(req, res){
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });


app.get('/oauth2callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    //Add the user data to the user collection if it is not already there

    //Use this to get a clean collection of the users
    //user_collection.remove(function(err, result) {});
    
    //Add their information to the database, if it is already not in there
    var currentDate = new Date();
    var user_data = [{
                      _id:req.user._json.link, 
                      email: req.user._json.email, 
                      name: req.user.displayName, 
                      joined: currentDate}] ;

    user_collection.insert(user_data, {w:1}, function(err, result) {});

    // Successful authentication, redirect to account.
    res.redirect('/account');
});


//Only show this page if the user is authenticated
app.get('/upload', 
        ensureAuthenticated, 
        function(req, res){
          res.render('upload', {  title: 'Select a Photo to upload ', 
                                  id: 'upload', 
                                  brand: brand })
});

app.get('/printusers', function(req, res){

    user_collection.find().toArray(function(err, items) {
  
    var locals = {
      title: "Signed-up Users",
      users: items
    };

    console.log(JSON.stringify(items));
    res.render('users', locals);
  });

});

app.get('/printphotos', function(req, res){

  photo_collection.find().toArray(function(err, items) {
  
    var locals = {
      title: "Uploaded Photos",
      photos: items,
      brand: brand,
    };

    res.render('photos', locals);
  });

});

app.get('/myphotos', 
        ensureAuthenticated, 
        function(req, res){
          //console.log(req.user._json.link);
          var user = (req.user == undefined) ? req.headers['user'] : req.user._json.link;
          photo_collection.find({'user': user}).toArray(function(err, items) {
            console.log(JSON.stringify(items));
            var locals = {
              title: "Uploaded Photos",
              photos: items,
              brand: brand,
            };

            res.render('photos', locals);
          });

});

app.post('/upload', ensureAuthenticated, function (req, res){

    //This works only if one file is uploaded at a time
    var file_name=req.files.upload.originalFilename;
    
    //For uploads from the chrome extension
    if (file_name == 'blob'){
      file_name = randomstring.generate(8) + '.png';
    }

    var path = req.files.upload.path;
    var size = req.files.upload.size;
    
    //var usage_restrictions = req.body.usage_restrictions; //let's assume there's only one

    // if ((typeof usage_restrictions) == "string"){
    //   usage_restrictions.push(req.body.usage_restrictions);
    // }
    // else{
    //   usage_restrictions = req.body.usage_restrictions;
    // }
    
    // console.log(usage_restrictions.length);
    
    //Housekeeping
    //photo_collection.remove(function(err, result) {});


    var additional_message;

    function insertPhotoToDB(file_name, additional_message){
      //add the image location to the database
      var current_date = new Date();
      
      var photo_data = [{
                          _id:      server_url + '/uploads/' + file_name, 
                          user:     (req.user == undefined) ? 
                                        req.headers['user_uri'] : 
                                        req.user._json.link ,
                          username: (req.user == undefined) ? 
                                        req.headers['user_name'] : 
                                        req.user.displayName,
                          uploaded: current_date,
                          usage_restrictions: (req.body.usage_restrictions == undefined) ? 
                                                  req.headers['usage_restrictions'] : 
                                                  req.body.usage_restrictions,
                        }];
      photo_collection.insert(photo_data, {w:1}, function(err, result) {
        if (err){
          //This file already exists, create a new name for it
          var myRe = /\.[0-9a-z]+$/i;
          var extension = myRe.exec(file_name)[0];
          old_file_name = file_name;
          file_name = randomstring.generate(8) + extension;

          additional_message = "Filename " + old_file_name + " already exists. Therefore renamed it to " + file_name; 
          insertPhotoToDB(file_name, additional_message);        
        }
        else{
            fs.rename(path, __dirname + '/uploads/' + file_name, function(e) {

            // Do what ever else you need to do.
            res.setHeader("upload-complete", "true");

            var message = additional_message + ' File '+ file_name + ' of size '+ size + ' bytes uploaded!' ;

            //Check if the request is made by the extension or not
            //If it is the chrome extension, do not send the HTML back

            if (req.headers.extension == 'true'){
              res.send(message);
            }
            else {
              res.render('upload', {  title: 'Select a Photo to upload ', 
                                id: 'upload', 
                                brand: brand,
                                message: message });
              
            }
            
          });
        }
      });

    }

    insertPhotoToDB(file_name, additional_message);



});



//var port = Number(process.env.PORT || 8080) ;
var port = 8080 ;
app.listen(port, function() {
	console.log("Listening on " + port);
    });

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {

  console.log(req.user);
  //the req.isAuthenticated comes from passport.js
  //in addition we are checking if the client sends a user header, they may also be authenticated 
  //with Google
  if (req.isAuthenticated() || req.headers['user_uri'] != undefined ) { return next(); }
  if (req.headers['extension'] == 'true'){
    res.send(server_url);
  }
  else{
      res.redirect('/');
  }
}

module.exports = app;