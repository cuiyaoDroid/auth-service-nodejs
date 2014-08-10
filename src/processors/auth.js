var qs = require('querystring');

//输入参数：id,name,portraitUri,deviceid，用于交换token
function process(req,res,db){
    var finish = false;
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        var postBody = qs.parse(body);
        if (postBody.id == null || postBody.name == null || postBody.portraitUri == null){
            res.writeHead(403,{'Content-Type': 'text/plain','Content-Length': "Missing parameter.".length});
            res.end("Missing parameter.");
            console.log("Missing parameter.");
            return;
        }
        authUser(postBody.id,postBody.name,postBody.portraitUri,res,req);
    });
}

var conf = require("../conf.json");
var http = require('http');

function authUser(id,name,portrait,res,req){
	// Build the post string from an object
	var post_data = qs.stringify({
		'userId' : id,
		'name': name,
		'portraitUri': portrait
	});

	// An object of options to indicate where to post to
	var post_options = {
		host: conf.apiHost,
		port: conf.apiPort,
		path: '/user/getToken.json',
		method: 'POST',
		headers: {
			'appKey': conf.appKey,
			'appSecret': conf.appSecret,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(post_data,'utf8')
		}
	};

	// Set up the request
	var post_req = http.request(post_options, function(response) {
        req.finish = true;
		response.setEncoding('utf8');
        var responseString = '';
        response.on('data',function(chunk){
            responseString += chunk;
        })
		response.on('end', function () {
			res.writeHead(response.statusCode, {'Content-Type': 'text/plain','Content-Length': Buffer.byteLength(responseString,'utf8')});
			res.end(responseString);
		});
	});

	post_req.on('error', function(e) {
        req.finish = true;
		console.log('problem with request: ' + e.message);
		res.writeHead(500,{'Content-Type': 'text/plain','Content-Length': e.message.length});
		res.end(e.message);
	});

	// post the data
	post_req.write(post_data);
	post_req.end();
}

exports.process = process;
