// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();

var mongo = require('mongodb');

var uristring = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

// var mongoUri = process.env.MONGOLAB_URI ||
//   process.env.MONGOHQ_URL ||
//   'mongodb://localhost/mydb';

// mongo.Db.connect(mongoUri, function (err, db) {
//   db.collection('mydocs', function(er, collection) {
//     collection.insert({'mykey': 'myvalue'}, {safe: true}, function(er,rs) {
//     });
//   });
// });

var mongoDb;
function connectToDb(done){
  mongo.connect(uristring, function (err, db) {
      if (err) {
         console.log ('ERROR connecting to: ' + uristring + '. ' + err);
      } else {
         console.log ('Succeeded connected to: ' + uristring);
         mongoDb = db;
         done();
      }
  });
}

connectToDb(function(){
   recipesToDB(yourRecipesObject);
});


function recipesToDB(recipes) {


     mongoDb.createCollection('recipes', function(err, collection) {});

     var collection = mongoDb.collection('recipes');

     collection.insert(recipes, {continueOnError: true}, 
     		function(err, result) {
	            if (err) {
	               console.log('ERROR:' + err);
	            } else {
	               console.log('success');
	            }
     		});
  	}

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
	res.send('Hello World!');
    });

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listening on " + port);
    });