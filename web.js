// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();

// mongo.Db.connect(mongoUri, function (err, db) {
//   db.collection('mydocs', function(er, collection) {
//     collection.insert({'mykey': 'myvalue'}, {safe: true}, function(er,rs) {
//     });
//   });
// });

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

app.get('/', function(req, res) {


	 collection.find().toArray(function(err, items) {
		 console.log(items.length);
	 });

	collection.findOne({mykey:1}, function(err, item) {
	    	res.send(item);
	});
    });

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listening on " + port);
    });