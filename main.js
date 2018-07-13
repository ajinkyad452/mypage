require('dotenv').config()
const https = require("https"),
  fs = require("fs");;
var express = require('express');
var FB = require('fb');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;

const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/momsim.in/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/momsim.in/fullchain.pem")
};
var admin = require("firebase-admin");
var serviceAccount = require("./212feac9ce31.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DB_URL
});
var db = admin.firestore();

function setupuser(accesstoken,id) {
	FB.setAccessToken(accesstoken);
	var myCollection = db.collection('users');
  	var queryUser = db.collection('users').doc(id);
  	var checkUser = queryUser.get()
  					.then(doc => {
				        //if (!doc.exists) {
				            console.log('No such document!');
				            myCollection.doc(id).set({
							     	profile: 'Ajinkya Dube',
							      	accessToken: accesstoken,
								isnow: true
							});
				        /*} else {
				            console.log('Document data:', doc.data());
							FB.options({accessToken: doc.data().accessToken});
				        }*/
				    })
				    .catch(err => {
				        console.log('Error getting document', err);
				    });
}
//console.log(process.env.CLIENT_SECRET);
//FB.options({accessToken: "EAAdapI3FsAcBAP7D9GiE0JtOORZB5XakGUC9ZBjhj0Y5Np9HuRSwBvgMyPLwh4T21GhDRZCeQVg5utR5MpqQvxAA1oT2yClQf1WExpR1cWdAvBjQh8vpRKFEZAEM9OeFQakJlZAx59PqCRR2PGEzf7xwxfmPAehEgTcc0jvDZAaUuSlxw98VvJuqzBQ6iNoR4ZD"});
passport.use(new Strategy({
    clientID: "2069987636654087",
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://momsim.in:8080/login/facebook/return",
    enableProof: true
  },
  function(accessToken, refreshToken, profile, cb) {
//console.log('Hello');
//console.log("refreshToken",refreshToken);
//console.log("profile",profile);
	console.log("AccessToken: ",accessToken);  
	setupuser(accessToken,profile.id);
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
app.get('/login/facebook/return', 
//console.log('test1');
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
console.log('test2');
    res.redirect('/');
  });

/*app.get('/login/facebook/return',
   (req, res, next) => {
   return passport.authenticate('facebook', {
          failureRedirect: '/login',
          session: false
          },
       (err, user, info) => {
          if(err) {
           console.log(err);
console.log(user);
console.log(info);
            res.redirect('/login');
          }
          else
          {
              next();
          }
      })(req, res, next);
  });*/



app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/facebook',
passport.authenticate('facebook',{authType: 'rerequest', scope:['email']}));

//  passport.authenticate('facebook',{scope: ['user_location', 'email', 'user_friends',"user_birthday","user_likes","user_friends","user_status","email","user_managed_groups","manage_pages","pages_manage_cta","pages_manage_instant_articles","pages_show_list","publish_pages","public_profile"]}));
//passport.authenticate('facebook',{authType: 'rerequest', scope:['email']}));
/*app.get('/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });*/

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
//	console.log("user req:",req);
//	console.log("user res:",res);
    res.render('profile', { user: req.user });
  });

app.get('/mylikes', function (req, res1) {
   FB.api('me?fields=likes.limit(30){name}', function (res) {
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

app.get('/feeds/:pageid', function (req, res1) {
   FB.api('/'+req.params.pageid+'/posts', { fields:["description","admin_creator","caption","created_time","timeline_visibility","type","message","attachments{description,description_tags,media,target,title,type,url,embed_html}"] }, function (res) {
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


app.get('/getdata/:id', function (req, res1) {
   FB.api('/'+req.params.id, function (res) {
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

app.get('/page/:id', function (req, res) {
	var pageid = '/'+req.params.id;
	getpagedata(pageid,res);

})
var getpagedata = function(pageid,res) {
	FB.api(pageid, function (response) {
		if(res && res.error) {
	        if(res.error.code === 'ETIMEDOUT') {
	            console.log('request timeout');
	        }
	        else {
	            console.log('error', res.error);
	        }
	    }
	    else {
	        res.send(response);
	    }
		
	});
}

app.get('/mypages', function (req, res1) {
	var myCollection = db.collection('users');
  	var queryUser = db.collection('users').doc('accestokens');
  	var checkUser =	queryUser.get()
  					.then(doc => {
				        if (!doc.exists) {
				            console.log('No such document!');
				            myCollection.doc('accestokens').set({
							      profile: 'Ajinkya',
							      accessToken: accesstoken
							});
				        } else {
				            console.log('Document data:', doc.data());
                            FB.options({accessToken: doc.data().accessToken});
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
					console.log('me/',res);
                                    res1.end( JSON.stringify(res));
                                }
                                });
				        }
				    })
				    .catch(err => {
				        console.log('Error getting document', err);
				    });
})

app.listen(8000);

https.createServer(options, app).listen(8080);

