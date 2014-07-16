
var brand = 'PhotoRM';

exports.index = function(req, res){

	var gapi = req.app.get('gapi');

	var url ;

	
	var locals = {
        title: 'PhotoRM: A Photo Sharing App to demonstrate HTTPA',
        url: gapi.url,
        id: 'home', 
        brand: brand,
        authenticated:  (req.app.get('code') != undefined),
        user: req.app.get('user')
    };
    console.log("***********"+locals.authenticated);
  	res.render('index', locals);

}

exports.home = function(req, res){
  res.render('home', { title: 'Home', id: 'home', brand: brand })
};

exports.about = function(req, res){
  res.render('about', { title: 'About', id: 'about', brand: brand })
};
