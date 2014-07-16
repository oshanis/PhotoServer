
var brand = 'PhotoRM';


exports.index = function(req, res){

	var gapi = req.app.get('gapi');

	var url ;

	var locals = {
        title: 'PhotoRM',
        subtitle: 'A Photo Sharing App to demonstrate HTTPA',
        id: 'home', 
        brand: brand,
        user: req.user
    };
  	res.render('index', locals);

};

exports.account = function(req, res){
  var locals = { 
    user: req.user 
  };
  res.render('account', locals);
};

exports.home = function(req, res){
  res.render('home', { title: 'Upload Photo', id: 'home', brand: brand })
};

exports.about = function(req, res){
  res.render('about', { title: 'About', id: 'about', brand: brand })
};
