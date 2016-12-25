//Lets require/import the HTTP module
var http = require('http');
var express = require('express');
// Using require() in ES5 
var FB = require('fb');

var app = express();
//Lets define a port we want to listen to
const PORT=8080; 

//We need a function which handles requests and send response
function handleRequest(request, response){
	FB.api('/businessinsider/posts', function (res) {
    if(res && res.error) {
        if(res.error.code === 'ETIMEDOUT') {
            console.log('request timeout');
        }
        else {
            console.log('error', res.error);
        }
    }
    else {
        console.log(res);
        //response.end(res + request.url);
        return res;
    }
});
    //response.end('It Works!! Path Hit: ' + request.url);
}

FB.options({accessToken: 'EAACEdEose0cBACEf0FxTDF0BuJ6prMcSGg61CPR6oZC4QwzvKT9z4eZCy4wFifDZCl0ImQN6ZCxstlMqk05Jj0b45RiFZAiRjuoHxZBNbjQNRWEb7pulfmEYLQxoHG2628cVPUaZBVVyn1JF2mQ6xkL92ECUt6Shytc94OZBkzeD6QZDZD'});


app.get('/getdata', function (req, res1) {
   FB.api('/businessinsider/posts', function (res) {
    if(res && res.error) {
        if(res.error.code === 'ETIMEDOUT') {
            console.log('request timeout');
        }
        else {
            console.log('error', res.error);
        }
    }
    else {
        //console.log(res);
        //response.end(res + request.url);
        //return res;
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
        //console.log(res);
        //response.end(res + request.url);
        //return res;
        res1.end( JSON.stringify(res));
    }
    });
})

var server = app.listen(PORT, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})
