var config = require('../config');

var brand = config.brand;

exports.index = function(req, res){

	var url ;

	var locals = {
        title: brand,
        subtitle: 'A Photo Sharing App to demonstrate HTTPA',
        id: 'home', 
        brand: brand,
        user: req.user
    };
  	res.render('index', locals);

};

exports.account = function(req, res){
  var locals = { 
    user: req.user,
    brand: brand 
  };
  res.render('account', locals);
};
