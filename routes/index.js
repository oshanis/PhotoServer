
/*
 * GET home page.
 */

var brand = 'Bootstrap for Jade';

exports.index = function(req, res){
//  res.redirect('/home');

	var gapi = req.app.get('gapi');
	
	var locals = {
        title: 'Photo Sharing App for HTTPA',
        url: gapi.url
    };
  	res.render('index.jade', locals);

}

exports.home = function(req, res){
  res.render('home', { title: 'Home', id: 'home', brand: brand })
};

exports.about = function(req, res){
  res.render('about', { title: 'About', id: 'about', brand: brand })
};
