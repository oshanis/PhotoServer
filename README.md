Deploying to Heroku
====================
web.js: Remember to change the server_url line
lib/gapi.js: change the client, secret and redirect

Unauthenticated Request from a client
=======================================
curl --form upload=@close.png --form press=OK localhost:5000/upload



Authentication is provided by OAuth
====================================
This client library was used in the implementation:
https://github.com/google/google-api-nodejs-client/

More information on using Google Oauth and Node.js:
http://javascriptplayground.com/blog/2013/06/node-and-google-oauth/

Although not used in this implementation, special attention should be given to the passport.js node module available at:
http://passportjs.org/


Image File Upload From form on the index page tested
=====================================================
For more information read this: 
http://tonyspiro.com/uploading-resizing-images-fly-node-js-express/


Amazon EC2 Setup
=================
The Amazon Instance is available at: http://ec2-54-186-231-154.us-west-2.compute.amazonaws.com/

Here is an example of developing a node js app with amazon ec2 and mongodb
http://thefloppydisk.wordpress.com/2013/04/25/a-node-js-application-on-amazon-cloud-part-3-a-simple-webserver-in-javascript-using-node-express-and-mongodb/

Instructions on setting up mongodb on Amazon EC2
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/

