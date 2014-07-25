Config File
===========
In config.js export the following values that are obtained from the Google OAuth API console:
GOOGLE_CLIENT_ID 
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
server_url
brand

e.g.
exports.server_url = "http://localhost:8080"
exports.brand = "localhost"



Debugging with one single entry
=============================
Make sure to comment the line with *_collection.remove when deploying.
This is only for debugging


Deploying to Heroku
====================
web.js: Remember to change the server_url line
lib/gapi.js: change the client, secret and redirect


Unauthenticated Request from a client
=======================================
Make note of the headers that need to be set from the client.
 curl --form upload=@goto.png --form press=OK --header "user_uri: https://plus.google.com/+OshaniSeneviratne" --header "user_name: Oshani Seneviratne" --header "usage_restrictions: http://usage_restrictions" localhost:8080/upload


Authentication is provided by OAuth
====================================
Decided to use Passport http://passportjs.org/
with passport-google-oauth: https://github.com/jaredhanson/passport-google-oauth/

[[This client library was used in the implementation:
https://github.com/google/google-api-nodejs-client/

More information on using Google Oauth and Node.js:
http://javascriptplayground.com/blog/2013/06/node-and-google-oauth/
]]


Image File Upload From form on the index page tested
=====================================================
With express 3 (which is needed to get passport working), we have to use this:
http://www.hacksparrow.com/handle-file-uploads-in-express-node-js.html

for some reason the above example didn't work, but followed Edit 2 of the answer here and it worked!
http://stackoverflow.com/questions/20348582/having-error-enoent-for-a-simple-image-upload-in-server

For express 4, can use the formidable module as described in this: 
http://tonyspiro.com/uploading-resizing-images-fly-node-js-express/


Amazon EC2 Setup
=================
The ImageHare.com Amazon Instance is available at: http://ec2-54-186-231-154.us-west-2.compute.amazonaws.com/
ssh ~/.ssh/aws.pem ubuntu@ec2-54-186-231-154

The PhotoRM.org Amazon Instance is available at: 
54.191.197.50
ssh ~/.ssh/aws.pem ubuntu@54.191.197.50

How to set up port forwarding etc on the Amazon EC2 instance
http://www.lauradhamilton.com/how-to-set-up-a-nodejs-web-server-on-amazon-ec2

Here is an example of developing a node js app with amazon ec2 and mongodb
http://thefloppydisk.wordpress.com/2013/04/25/a-node-js-application-on-amazon-cloud-part-3-a-simple-webserver-in-javascript-using-node-express-and-mongodb/

Instructions on setting up mongodb on Amazon EC2
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/


Mongodb on Mac
==============
Followed instructions from this (from step 3) for installing
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/

To run:
cd /usr/local/mongodb/bin
./mongod

Potential Errors that you may run into when deploying the app
==============================================================
" Error: ENOENT, open <file path>"
This is because the "uploads" folder does not exist



