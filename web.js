// web.js
var express = require("express"),
	  app = express(),
    http = require('http'),
    path = require('path'),
    gapi = require('./lib/gapi'),
	  logfmt = require("logfmt");

// mongo.Db.connect(mongoUri, function (err, db) {
//   db.collection('mydocs', function(er, collection) {
//     collection.insert({'mykey': 'myvalue'}, {safe: true}, function(er,rs) {
//     });
//   });
// });

var my_calendars = [],
    my_profile = {},
    my_email = '';

// Retrieve
var MongoClient = require('mongodb').MongoClient;

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost:27017/exampleDb';

var collection;

// Connect to the db
MongoClient.connect(mongoUri, function(err, db) {
  	if(err) { return console.dir(err); }

  	collection = db.collection('test');
  	var docs = [{mykey:1}, {mykey:2}, {mykey:3}];

  	collection.insert(docs, {w:1}, function(err, result) {});

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

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


app.get('/', function(req, res) {

	var locals = {
        title: 'This is Oshani sample app',
        url: gapi.url
    };
  	res.render('index.jade', locals);


	// collection.findOne({mykey:1}, function(err, item) {
	//     	res.send(item);
	// });

});

app.get('/oauth2callback', function(req, res) {
  
  var code = req.query.code;
  console.log(code);
  gapi.client.getToken(code, function(err, tokens){
    gapi.client.credentials = tokens;
    getData();
  });
  
  var locals = {
        title: 'My sample app',
        url: gapi.url
      };
  res.render('index.jade', locals);
});

var getData = function() {
  gapi.oauth.userinfo.get().withAuthClient(gapi.client).execute(function(err, results){
      console.log(results);
      my_email = results.email;
      my_profile.name = results.name;
      my_profile.birthday = results.birthday;
  });
  gapi.cal.calendarList.list().withAuthClient(gapi.client).execute(function(err, results){
    console.log(results);
  });
};

app.get('/cal', function(req, res){
  var locals = {
    title: "These are your calendars",
    user: my_profile.name,
    bday: my_profile.birthday,
    email: my_email
  };
  res.render('cal.jade', locals);
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listening on " + port);
    });