require('dotenv').config()
var express = require('express');
var FB = require('fb');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;

var admin = require("firebase-admin");
var serviceAccount = require("./212feac9ce31.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DB_URL
});
var db = admin.firestore();

function setupuser(accesstoken) {
	var myCollection = db.collection('users');
  	var queryUser = db.collection('users').doc('accestokens');
  	var checkUser = queryUser.get()
  					.then(doc => {
				        if (!doc.exists) {
				            console.log('No such document!');
				            myCollection.doc('accestokens').set({
							      profile: 'Ajinkya',
							      accessToken: accesstoken
							});
				        } else {
				            console.log('Document data:', doc.data());
							FB.options({accessToken: process.env.FB_TOKEN});
				        }
				    })
				    .catch(err => {
				        console.log('Error getting document', err);
				    });
}

passport.use(new Strategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, cb) {
  	setupuser(accessToken);
    return cb(null, profile);
}));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
//	console.log("user req:",req);
//	console.log("user res:",res);
    res.render('profile', { user: req.user });
  });

app.get('/mylikes', function (req, res1) {
   FB.api('me?fields=likes.limit(10){name}', function (res) {
    if(res && res.error) {
        if(res.error.code === 'ETIMEDOUT') {
            console.log('request timeout');
        }
        else {
            console.log('error', res.error);
        }
    }
    else {
        res1.end( JSON.stringify(res));
    }
    });
})
app.get('/mypermissions', function (req, res1) {
   // var accessToken = 'EAACEdEose0cBAJqqGhGPhpQ4p8MtmlgEhzcJoYW8wQhSRad0GmL30VvnR8YOw3iMZC2jKYLeqgSLChTAaipRZCrdstJnjiSLPGjTvML7HkKSKne0kUlR0r5ZBwoZC9SYEcJodVNrEVoxtltglo27paUa9fdQRCkoxOGjsXZCQeOlquTQRFTsdBBescUSnbDMZD';
   
   FB.api('me/permissions', function (res) {
    if(res && res.error) {
        if(res.error.code === 'ETIMEDOUT') {
            console.log('request timeout');
        }
        else {
            console.log('error', res.error);
        }
    }
    else {
        res1.end( JSON.stringify(res));
    }
    });
})

app.listen(8080);

