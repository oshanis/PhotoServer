
var brand = 'HTTPA Demo: PhotoRM';

exports.index = function(req, res){

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
