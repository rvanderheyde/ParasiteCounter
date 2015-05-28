var path = require('path');
// var cv = require('opencv')
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

routes.useOpenCV = function (req, res){
	// var filename = '../public/img/slide1.png'
	// var filename = path.join(__dirname, '../public'+req.body.filename);
	// var lowThresh = req.body.val1;
	// var highThresh = req.body.val;
	// // var filename = './parasite1.tif';
	// console.log(filename);
	// cv.readImage(filename, function(err, im){
	// 	if (err) {
	// 		throw err
	// 	} else {
	// 		var width = im.width();
 //  			var height = im.height();
 //  			if (width < 1 || height < 1){
 //  				throw new Error('No size')
 //  			} else {
	// 			var nIters = 2;
	// 			var maxArea = 1000;
	// 			var count = 0;
	// 			var centers = []
	// 			var areas = []

	// 			// var lower_threshold = [40, 0, 40];
	// 			// var upper_threshold = [100, 35, 100];
	// 			var GREEN = [0, 255, 0]; // B, G, R
	// 			var WHITE = [255, 255, 255]; // B, G, R
	// 			var RED   = [0, 0, 255]; // B, G, R

	// 			var big = new cv.Matrix(height, width);
 //  				var all = new cv.Matrix(height, width);
 //  				im.convertGrayscale();
 //  				im_canny = im.copy();
 //  				// im_color = im.copy();
 //  				im_canny.canny(lowThresh, highThresh);
 //  				im_canny.dilate(nIters);
 //  				// im_color.inRange(lower_threshold, upper_threshold);

 //  				contours = im_canny.findContours();
 //  				for(i = 0; i < contours.size(); i++) {
	// 			    if(contours.area(i) > maxArea) {
	// 			    	count+=1;
	// 			      	var moments = contours.moments(i);
	// 			      	var cgx = Math.round(moments.m10 / moments.m00);
	// 			      	var cgy = Math.round(moments.m01 / moments.m00);
	// 			      	centers.push([cgx,cgy]);
	// 			      	areas.push(contours.area(i))
	// 			      	big.drawContour(contours, i, GREEN);
	// 			      	big.line([cgx - 5, cgy], [cgx + 5, cgy], RED);
 //      					big.line([cgx, cgy - 5], [cgx, cgy + 5], RED);
 //      				}
 //      			}
 //      			console.log(count)
 //      			all.drawAllContours(contours, WHITE);
 //      			// im_color.save(path.join(__dirname,'../public/tmp/color.png'));
 //      			big.save(path.join(__dirname, '../public/tmp/big.png'));
 //  				all.save(path.join(__dirname, '../public/tmp/all.png'));
 //  				res.send({count: count, centers: centers, areas: areas})
 //  			}
	// 	}			
	// });
};

function emptyObjTest(obj){
  return Object.keys(obj).length === 0;
};

module.exports = routes;