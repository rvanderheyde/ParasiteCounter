var mongoose = require('mongoose');
var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var routes = require('./routes/routes');
var auth = require('./routes/auth');

var app = express();

var mongoURI = process.env.MONGOURI || "mongodb://localhost/test";
var PORT = process.env.PORT || 3000;
var CLIENTID= process.env.CLIENTID || require('./oauth.js').facebook.clientID;
var CLIENTSECRET = process.env.CLIENTSECRET || require('./oauth.js').facebook.clientSecret;
var CALLBACKURL = process.env.CALLBACKURL || require('./oauth.js').facebook.callbackURL;

mongoose.connect(mongoURI);

passport.serializeUser(function(user, done) {
done(null, user);
});
passport.deserializeUser(function(obj, done) {
done(null, obj);
});

passport.use(new FacebookStrategy({
 clientID: CLIENTID,
 clientSecret: CLIENTSECRET,
 callbackURL: CALLBACKURL
 // profileFields: ['id', 'displayName']
}, 
function(accessToken, refreshToken, profile, done) {
 process.nextTick(function () {//change once user model is available
   return done(null, profile);
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

app.get('/', routes.homeRender)
app.get('/home', routes.indexRender)
app.get('/auth/facebook', passport.authenticate('facebook'), auth.fbAuth);
app.get('/auth/facebook/callback',passport.authenticate('facebook', { failureRedirect: '/' }), auth.fbAuthCallback);

app.listen(PORT, function() {
  console.log("Application running on port:", PORT);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
    res.send(401)
}