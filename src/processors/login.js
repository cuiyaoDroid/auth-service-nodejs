var qs = require('querystring');

function process(req,res,db){
    var finish = false;
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        var postBody = qs.parse(body);
        if (postBody.email == null || postBody.password == null || postBody.deviceid == null){
            res.writeHead(403,{'Content-Type': 'text/plain','Content-Length': "Missing parameter.".length});
            res.end("Missing parameter.");
            console.log("Missing parameter.");
            return;
        }
        loginUser(postBody.email,postBody.password,postBody.deviceid,db,res,req);
    });
}

function loginUser(email,password,deviceId,db,res,req){
    db.get("select * from user where email = ?",email,function(err,row){
        if (err != null){
            res.writeHead(500,{'Content-Type': 'text/plain','Content-Length': "Server error".length});
            res.end("Server error");
            console.log(err);
        }else if (typeof row == "undefined"){
            res.writeHead(403,{'Content-Type': 'text/plain','Content-Length': "User is not registered.".length});
            res.end("User is not registered.");
            console.log(email + " is not registered.");
        }else{
            if (password == row.passwd){
                getToken(row.id,row.username,row.portrait,row.email,deviceId,res,req);
            } else {
                res.writeHead(401,{'Content-Type': 'text/plain','Content-Length': "Password error!".length});
                res.end("Password error!");
                console.log(email + " passwd error!");
            }
        }
    })
}

var conf = require("../conf.json");

var http = require('http');

function getToken(userId,userName,userPortrait,email,deviceId,res,req) {
	// Build the post string from an object
	var post_data = qs.stringify({
		'userId' : userId,
		'userName': userName,
		'userPortrait': userPortrait,
		'deviceId': deviceId
	});

	// An object of options to indicate where to post to
	var post_options = {
		host: conf.apiHost,
		port: conf.apiPort,
		path: '/reg.json',
		method: 'POST',
		headers: {
			'appKey': conf.appKey,
			'appSecret': conf.appSecret,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length
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
            responseString.cookie = userId;
            var obj = JSON.parse(responseString);
            obj.cookie = email;
            obj.userName = userName;
            responseString = JSON.stringify(obj);
			res.writeHead(response.statusCode, {'Content-Type': 'text/plain','Content-Length': Buffer.byteLength(responseString,'utf8')});
			res.end(responseString);
		});
	});

	post_req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
		res.writeHead(500,{'Content-Type': 'text/plain','Content-Length': e.message.length});
		res.end(e.message);
	});

	// post the data
	post_req.write(post_data);
	post_req.end();
}

exports.process = process;
