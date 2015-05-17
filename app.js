var mongoose = require('mongoose');
var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var multer  = require('multer');

var routes = require('./routes/routes');
var auth = require('./routes/auth');
var schema = require('./models/model');
var User = schema.User;

var app = express();

var mongoURI = process.env.MONGOURI || "mongodb://localhost/test";
var PORT = process.env.PORT || 3000;
var CLIENTID= process.env.CLIENTID || require('./oauth.js').facebook.clientID;
var CLIENTSECRET = process.env.CLIENTSECRET || require('./oauth.js').facebook.clientSecret;
var CALLBACKURL = process.env.CALLBACKURL || require('./oauth.js').facebook.callbackURL;

mongoose.connect(mongoURI);

passport.serializeUser(function(user, done) {
	done(null, {id: user.facebookId, name: user.name});
});

passport.deserializeUser(function(obj, done) {
	User.findOne({facebookId: obj.id}, function(err, user){
		done(null, user);
	});
});

passport.use(new FacebookStrategy({
 clientID: CLIENTID,
 clientSecret: CLIENTSECRET,
 callbackURL: CALLBACKURL
 // profileFields: ['id', 'displayName']
}, 
function(accessToken, refreshToken, profile, done) {
 User.findOne({facebookId: profile.id}, function (err, user) {
   if (user){
   	return done(null, user);
   } else{
   	var user = new User({name: profile.displayName, facebookId: profile.id});
   	user.save(function(err, user){
   		return done(null, user);
   	})
   }
   
 });
}
));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'This is not a secret ;)',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(multer({
  dest: './public/img/',
  rename: function (fieldname, filename) {
    //something here to makesure files are all different names
    return filename.replace(/\W+/g, '-').toLowerCase()
  }
}))

app.get('/', routes.homeRender)
app.get('/home', routes.indexRender)

app.post('/upload', ensureAuthenticated, routes.uploadHandler)

app.get('/session/user', ensureAuthenticated, auth.getUsername);
app.post('/session/end', ensureAuthenticated, auth.logout);
app.get('/auth/facebook', passport.authenticate('facebook'), auth.fbAuth);
app.get('/auth/facebook/callback',passport.authenticate('facebook', { failureRedirect: '/' }), auth.fbAuthCallback);

app.listen(PORT, function() {
  console.log("Application running on port:", PORT);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
    res.sendStatus(401)
}