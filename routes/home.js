exports.home = function(req, res){
  res.render('home', { title: 'Home', id: 'home', brand: brand })
};