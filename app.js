//Lets require/import the HTTP module
var http = require('http');
var express = require('express');
// Using require() in ES5 
var FB = require('fb');

var app = express();
//Lets define a port we want to listen to
const PORT=8080; 

app.get('/', function (req, res1) {
   
        res1.end("Hello Welcome ");
        //res1.sendFile('index.html');
    
})



FB.api('oauth/access_token', {
    client_id: '866100573474781',
    client_secret: '3326fb75cb54a353ae91194bef7e15b7',
    grant_type: 'client_credentials'
}, function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }
    console.log('token---->',res.access_token);
 
    var accessToken = res.access_token;
    FB.setAccessToken(accessToken);
    var accessToken = FB.getAccessToken();


FB.api('me', { fields: ['id', 'name'], access_token: accessToken }, function (res) {
    console.log(res);
});
    //FB.options({accessToken: 'EAACEdEose0cBACZBH4HVCpIlfAYVYtcXdfqU6mNL9HqTQKVzZB0PLJC6cWGmsQZArlxAxnyEqbHgi8oCshp9tInUlYYVwu48jX9NNQrHLu9w9er8khuRrtrjFNKeVbX76OsEPJ0Ru8ZCaZBM8T9YSYeYgYXrsKAlPZBllXNKFcxwZDZD'});

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
