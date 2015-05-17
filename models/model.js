var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var exports = {};

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {});
exports.db = db;

var imageSchema = Schema({
	name: String,
	cells: [[Number,Number]],
	parasites: [[Number,Number]],
	cellCount: Number,
	parasiteCount: Number
})

exports.Images = mongoose.model('Image', imageSchema);

var userSchema = Schema({
  name: String,
  facebookId: String,
  images: [{type: Schema.Types.ObjectId, ref:'Image'}]
});

exports.User = mongoose.model('User', userSchema);

module.exports = exports;