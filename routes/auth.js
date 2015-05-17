routes = {};

routes.fbAuth = function(req, res){
  
};

routes.fbAuthCallback = function(req, res){
  //callback for facebook passport
  console.log('FB returns ' + req.user.name);
  res.redirect('/home')
};

routes.logout = function(req, res) {
  req.session.destroy(function(err){
  	res.send('logout');
  });
};

routes.getUsername = function(req, res){
  //find user from session
  if (emptyObjTest(req.user) === true){
    res.send('error');
  } else {
    var username = req.user.name;
    var id = req.user.facebookId;
    var obj = { userName: username, id: id};
    if (!username){
      res.send('No User');
    } else {
      res.send(obj);
    }
  }
};

function emptyObjTest(obj){
  return Object.keys(obj).length === 0;
};
module.exports = routes;
