var path = require('path');
var schema = require('../models/model');
var User = schema.User;
var Images = schema.Images;
routes = {}

routes.homeRender = function(req, res) {
  var url = path.resolve( __dirname + '../../views/main.html');
  res.sendFile(url);
};

routes.indexRender = function(req, res) {
  var url = path.resolve( __dirname + '../../views/main.html');
  res.sendFile(url);
};

routes.uploadHandler = function(req, res){
	console.log(req.files);
	Images.findOne({name: req.files.file.name}, function(err, image){
		console.log(image)
		if (image){

		} else {
			res.send('')
		}
	})
};

function emptyObjTest(obj){
  return Object.keys(obj).length === 0;
};

module.exports = routes;