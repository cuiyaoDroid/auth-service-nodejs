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
        if (postBody.email == null || postBody.username == null || postBody.password == null){
            res.writeHead(403,{'Content-Type': 'text/plain','Content-Length': "Missing parameter.".length});
            res.end("Missing parameter.");
            console.log("Missing parameter.");
            return;
        }
        regUser(postBody.email,postBody.username,
            "http://www.gravatar.com/avatar/" + md5(postBody.email.toLowerCase().trim()) + "?s=82",
            postBody.password,db,res);
    });
}

function regUser(email,username,userportrait,password,db,res){
    db.get("select * from user where email = ?",email,function(err,row){
        if (err != null){
            res.writeHead(500,{'Content-Type': 'text/plain','Content-Length': "Server error".length});
            res.end("Server error");
            console.log(err);
        }else if (typeof row == "undefined"){
            db.run("insert into user (email,username,portrait,passwd) values (?,?,?,?)",
                email,username,userportrait,password);
            var obj = new Object();
            obj.code = 200;
            var responseString = JSON.stringify(obj);
            res.writeHead(200,{'Content-Type': 'text/plain','Content-Length': Buffer.byteLength(responseString,'utf8')});
            res.end(responseString);
        }else{
            res.writeHead(403,{'Content-Type': 'text/plain','Content-Length': "User already exist".length});
            res.end("User already exist");
            console.log(row.id + " is already exist");
        }
    })
}

function md5(str){
    var crypto = require('crypto');
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
}

exports.process = process;
