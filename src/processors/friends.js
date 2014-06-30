var qs = require('querystring');

function process(req,res,db){
    var finish = false;
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        req.finish = true;
        var postBody = qs.parse(body);
        if (postBody.cookie == null){
            res.writeHead(403,{'Content-Type': 'text/plain','Content-Length': "Missing parameter.".length});
            res.end("Missing parameter.");
            console.log("Missing parameter.");
            return;
        }
        getFriends(postBody.cookie,db,res);
    });
}

function getFriends(email,db,res){
    db.all("select id,username,portrait from user"/* where email <> ?",email*/,function(err,rows){
        if (err != null){
            res.writeHead(500,{'Content-Type': 'text/plain','Content-Length': "Server error".length});
            res.end("Server error");
            console.log(err);
        }else if (typeof rows == "undefined"){
            res.writeHead(500,{'Content-Type': 'text/plain','Content-Length': "Server error".length});
            res.end("Server error");
            console.log(rows);
        }else{
            var responseString = JSON.stringify(rows);
            res.writeHead(200,{'Content-Type': 'text/plain','Content-Length': Buffer.byteLength(responseString,'utf8')});
            res.end(responseString);
        }
    })
}

exports.process = process;
