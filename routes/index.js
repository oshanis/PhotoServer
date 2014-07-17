var brand = 'PhotoRM';

exports.index = function(req, res){

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
    user: req.user,
    brand: brand 
  };
  res.render('account', locals);
};

