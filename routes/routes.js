var path = require('path');

routes = {}

routes.homeRender = function(req, res) {
  var url = path.resolve( __dirname + '../../views/main.html');
  res.sendFile(url);
};

routes.indexRender = function(req, res) {
  var url = path.resolve( __dirname + '../../views/main.html');
  res.sendFile(url);
};

module.exports = routes;