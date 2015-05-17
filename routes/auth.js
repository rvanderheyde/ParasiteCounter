routes = {};

routes.fbAuth = function(req, res){
  
};

routes.fbAuthCallback = function(req, res){
  //callback for facebook passport
  console.log('FB returns ' + req.session.passport.user.displayName);
  res.redirect('/home')
};

module.exports = routes;
