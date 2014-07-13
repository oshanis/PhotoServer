var googleapis = require('googleapis'),
    OAuth2Client = googleapis.OAuth2Client,
    client = '736056096064-o2b4h5ttm6g3u0emscle1vmemcbihebb.apps.googleusercontent.com',
    secret = 'UnO6RMVMc755ZVNg92ivRzRM',
    //redirect = 'http://localhost:5000/oauth2callback',
    redirect = 'http://httpa-photo-server.herokuapp.com/oauth2callback',
    calendar_auth_url = '',
    oauth2Client = new OAuth2Client(client, secret, redirect);

exports.ping = function() {
    console.log('pong');
};

calendar_auth_url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar'
});

exports.url = calendar_auth_url;

exports.client = oauth2Client;

googleapis
    .discover('urlshortener', 'v1')
    .discover('plus', 'v1')
    .discover('calendar', 'v3')
	.discover('oauth2', 'v2')
	.execute(function(err, client) {

	  if (err) {
	    console.log('Problem during the client discovery.', err);
	    return;
	  }
	  var params = { shortUrl: 'http://goo.gl/DdUKX' };
	  var getUrlReq = client.urlshortener.url.get(params);

	  getUrlReq.execute(function (err, response) {
	    console.log('Long url is', response.longUrl);
	  });

	  exports.cal = client.calendar;
      exports.oauth = client.oauth2;
      exports.client = oauth2Client;
      exports.url = calendar_auth_url;

});
