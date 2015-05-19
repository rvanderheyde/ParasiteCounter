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
	//updates db on upload of a file
	console.log(req.files);
	User.findOne({facebookId: req.user.facebookId}, function(err, user){
		Images.findOne({name: req.files.file.name}, function(err, image){
			console.log(image)
			if (image){

			} else {
				var image = new Images({name: req.files.file.name, cells:[], parasites:[], _uploader: req.user.facebookId})
				image.save(function(err){
					user.images.push(image)
					user.save(function(err){})
				})
				res.send('')
			}
		})
	})
	
};

routes.imageGetter = function(req, res){
	//searches the db to get user's images
	console.log(req.user.images);
	var imageList = []
	Images.find({_uploader: req.user.facebookId}, function(err, images){
		for(var i=0; i<images.length;i++){
			if (i<5){
				imageList.push('/img/'+images[i].name);
			} else {
				break
			}
		}
		res.send({imageList: imageList})
	})
	
};

function emptyObjTest(obj){
  return Object.keys(obj).length === 0;
};

module.exports = routes;