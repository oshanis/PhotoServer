// web.js
var express = require("express"),
	  app = express(),
    http = require('http'),
    path = require('path'),
    gapi = require('./lib/gapi'),
	  logfmt = require("logfmt"),
    formidable = require('formidable'),
    util = require('util')
    fs   = require('fs-extra'),
    qt   = require('quickthumb');

// mongo.Db.connect(mongoUri, function (err, db) {
//   db.collection('mydocs', function(er, collection) {
//     collection.insert({'mykey': 'myvalue'}, {safe: true}, function(er,rs) {
//     });
//   });
// });

var my_profile = {},
    my_email = '';

//var server_url = 'http://localhost:5000/';
var server_url = 'http://httpa-photo-server.herokuapp.com/';

// Retrieve
var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost:27017/exampleDb';

var collection;
var user_collection;
var photo_collection;

// Connect to the db
MongoClient.connect(mongoUri, function(err, db) {
  	if(err) { return console.dir(err); }

  	collection = db.collection('test');
  	var docs = [{mykey:1}, {mykey:2}, {mykey:3}];

  	collection.insert(docs, {w:1}, function(err, result) {});

    //Instantiate the users table to store their data
    user_collection = db.collection('users');
    
  	// var collection = db.collection('test');
  	// var docs = [{mykey:1}, {mykey:2}, {mykey:3}];

  	// collection.insert(docs, {w:1}, function(err, result) {

	  // 	collection.find().toArray(function(err, items) {});

	  //   collection.findOne({mykey:1}, function(err, item) {
	  //   	console.log("ITEM = "+item["mykey"]);
	  //   });

   //  });

});

app.use(logfmt.requestLogger());
// Use quickthumb
app.use(qt.static(__dirname + '/'));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


app.get('/', function(req, res) {

	var locals = {
        title: 'Photo Sharing App for HTTPA',
        url: gapi.url
    };
  	res.render('index.jade', locals);


	// collection.findOne({mykey:1}, function(err, item) {
	//     	res.send(item);
	// });

});

//After the user is authenticated by Google, redirect to the page displaying their 
//personal information
app.get('/oauth2callback', function(req, res) {
  
  var code = req.query.code;
  console.log(code);
  gapi.client.getToken(code, function(err, tokens){
    gapi.client.credentials = tokens;
    getData(req, res);
  });
  
});

var getData = function(req, res) {
  gapi.oauth.userinfo.get().withAuthClient(gapi.client).execute(function(err, results){
      console.log(results.link);
      my_email = results.email;
      my_profile.name = results.name;
      
      //user_collection.remove(function(err, result) {});
      
      //Add their information to the database
      var current_date = new Date();
      var user_data = [{_id:my_email, name:my_profile.name, joined: current_date}] ;
      user_collection.insert(user_data, {w:1}, function(err, result) {});


      //Redirect
      res.writeHead(301, {Location: server_url+'user'});
      res.end();

  });
  gapi.cal.calendarList.list().withAuthClient(gapi.client).execute(function(err, results){
    console.log(results);
  });


};

app.get('/user', function(req, res){
  var locals = {
    title: "Your personal info",
    user: my_profile.name,
    bday: my_profile.birthday,
    email: my_email
  };

  user_collection.find().toArray(function(err, items) {
    // console.log("*************");
    // console.log(items);

  });

  res.render('cal.jade', locals);
});


app.get('/printusers', function(req, res){
  user_collection.find().toArray(function(err, items) {
  
    var locals = {
      title: "Details of users",
      users: items
    };

    res.render('users.jade', locals);
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
   var new_location = 'uploads/';

   fs.copy(temp_path, new_location + file_name, function(err) {  
     if (err) {
       console.error(err);
     } 
     else {
      	console.log("success!");
     }
   });
  });
});



var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listening on " + port);
    });