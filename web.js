// web.js
var express = require("express"),
	  app = express(),
    http = require('http'),
    path = require('path'),
    gapi = require('./lib/gapi'),
    routes = require('./routes'),
	  logfmt = require("logfmt"),
    formidable = require('formidable'),
    util = require('util')
    fs   = require('fs-extra'),
    qt   = require('quickthumb'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// var GOOGLE_CLIENT_ID = '736056096064-o2b4h5ttm6g3u0emscle1vmemcbihebb.apps.googleusercontent.com',
//     GOOGLE_CLIENT_SECRET = 'UnO6RMVMc755ZVNg92ivRzRM',
//     GOOGLE_CALLBACK_URL = 'http://localhost:5000/oauth2callback';

var GOOGLE_CLIENT_ID = '736056096064-4qsbj6uvec0am09ocijnvfo6akic5tqo.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET =  'RIy7_V7jvVycIeUWRBoyi0Iw',
    GOOGLE_CALLBACK_URL = 'http://ec2-54-186-231-154.us-west-2.compute.amazonaws.com/oauth2callback',

//var server_url = 'http://localhost:5000';
//var server_url = 'http://httpa-photo-server.herokuapp.com';
var server_url = 'http://ec2-54-186-231-154.us-west-2.compute.amazonaws.com';


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
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//Setting the usage restrictions for the images served from this website
//Make sure to call next() only when the call to the db is complete
//Otherwise no usage_restrictions will be set on the request
app.use(function(req, res, next) {
  var matchUrl = '/';
  if(req.url.substring(0, matchUrl.length) === matchUrl) {
    console.log(server_url+req.url);
    photo_collection.findOne({"_id":server_url+req.url}, function(err, item) {
       if (item){
        console.log("***********" + item.user);
        res.setHeader("Usage-Restrictions", item.user);
       }
       return next();
    });

  }

});


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
    // Successful authentication, redirect to account.
    res.redirect('/account');
});

// mongo.Db.connect(mongoUri, function (err, db) {
//   db.collection('mydocs', function(er, collection) {
//     collection.insert({'mykey': 'myvalue'}, {safe: true}, function(er,rs) {
//     });
//   });
// });

var my_profile = {},
    my_email = '',
    my_url = '';


// Retrieve
var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost:27017/exampleDb' ||
  'mongodb://ec2-54-186-231-154.us-west-2.compute.amazonaws.com:27017/exampleDb';

var collection;
var user_collection;
var photo_collection;
var provenance_collection;

// Connect to the db
MongoClient.connect(mongoUri, function(err, db) {
  	if(err) { return console.dir(err); }

  	collection = db.collection('test');
  	var docs = [{mykey:1}, {mykey:2}, {mykey:3}];

  	collection.insert(docs, {w:1}, function(err, result) {});

    //Instantiate the users table to store their data
    user_collection = db.collection('users');
    photo_collection = db.collection('photos');
    
  	// var collection = db.collection('test');
  	// var docs = [{mykey:1}, {mykey:2}, {mykey:3}];

  	// collection.insert(docs, {w:1}, function(err, result) {

	  // 	collection.find().toArray(function(err, items) {});

	  //   collection.findOne({mykey:1}, function(err, item) {
	  //   	console.log("ITEM = "+item["mykey"]);
	  //   });

   //  });

});


//Setting this library so that it can be accessed in the routes
//app.set('gapi', gapi);



app.get('/home', routes.home);

//After the user is authenticated by Google, redirect to the page displaying their 
//personal information
// app.get('/oauth2callback', function(req, res) {
  
//   var code = req.query.code;
//   gapi.client.getToken(code, function(err, tokens){
//     gapi.client.credentials = tokens;
//     getData(req, res);
//   });
  
// });


var getData = function(req, res) {
  gapi.oauth.userinfo.get().withAuthClient(gapi.client).execute(function(err, results){
      console.log(results.link);
      my_email = results.email;
      my_profile.name = results.name;
      my_url = results.link;

      //There is a bug with this when concurrent users are logged in
      //app.set('user', my_url);
      
      //Use this to get a clean collection of the users
      //user_collection.remove(function(err, result) {});
      
      //Add their information to the database
      var current_date = new Date();
      var user_data = [{_id:my_url, email: my_email, name:my_profile.name, joined: current_date}] ;
      user_collection.insert(user_data, {w:1}, function(err, result) {});


      //Redirect
      res.writeHead(301, {Location: server_url+'/user'});
      res.end();

  });

};

app.get('/user', function(req, res){
  var locals = {
    title: "Your personal info",
    user: my_profile.name,
    bday: my_profile.birthday,
    email: my_email,
  };

  res.render('user.jade', locals);
});


app.get('/printusers', function(req, res){
  user_collection.find().toArray(function(err, items) {
  
    var locals = {
      title: "Signed-up Users",
      users: items
    };

    res.render('users.jade', locals);
  });

});

app.get('/printphotos', function(req, res){
  photo_collection.find().toArray(function(err, items) {
  
    var locals = {
      title: "Uploaded Photos",
      photos: items
    };

    res.render('photos.jade', locals);
  });

});


app.get('/upload', function(req, res){

  var message = my_email == '' ? " you are not logged in" : "logged in as "+ my_email
  
  var locals = {
    title: "Photo Upload",
    message: message
  };

  res.render('upload.jade', locals);

});

app.post('/upload', function (req, res){

  //Housekeeping
  //photo_collection.remove(function(err, result) {});
 
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'content-type': 'text/plain'});
    res.write('received upload:\n\n');
    res.end(util.inspect({fields: fields, files: files}));
  });

 form.on('end', function(fields, files) {
   /* Temporary location of our uploaded file */
  	var temp_path = this.openedFiles[0].path;
   /* The file name of the uploaded file */
   var file_name = this.openedFiles[0].name;
   /* Location where we want to copy the uploaded file */
   var new_location = '/uploads/';
   var photo_url = server_url + new_location + file_name;

   console.log(temp_path);
    console.log(photo_url);

    //Important: We require the 'uploads/' here because fs requires it that way!
   fs.copy(temp_path, 'uploads/' + file_name , function(err) {  
     if (err) {
       console.error(err);
     } 
     else {
      	console.log("success!");

        //add the image location to the database
        //
        var current_date = new Date();
        var photo_data = [{_id:photo_url, user: my_url, uploaded: current_date}] ;
        photo_collection.insert(photo_data, {w:1}, function(err, result) {});

     }
   });
  });
});



var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listening on " + port);
    });

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}