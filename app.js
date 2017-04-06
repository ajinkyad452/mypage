//Lets require/import the HTTP module
var http = require('http');
var express = require('express');
var config = require('./config');
// Using require() in ES5 
var FB = require('fb');

var app = express();
//Lets define a port we want to listen to
const PORT=8080; 

FB.options({accessToken: config.facebook.token});

app.get('/', function (req, res1) {
   
        res1.end("Hello Welcome ");
        //res1.sendFile('index.html');
    
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

app.get('/feeds/:pageid', function (req, res1) {
   FB.api('/'+req.params.pageid+'/posts', function (res) {
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


var server = app.listen(PORT, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
