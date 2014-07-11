/**
 * post userName and a fake password to this server to get a token 
 * for login Rong Cloud
 * Created by stirp
 * Date: 2014-05-04
 * Time: 18:01
 */ 

var host = '0.0.0.0';//监听地址
var port = 8080;//监听端口
var http = require('http');
var qs = require('querystring');
var path = require('path');
var basedir = path.resolve(__dirname,"..");
var source = path.resolve(__dirname);
var routes = require(path.join(source,'route.json'));

var conf = require(path.join(source,'conf.json'));

http.createServer(function (req, res) { 
 	req.finish = false;

    for(var route in routes){
        if (routes[route].path == req.url && routes[route].method == req.method){
            var processor = require(path.join(source,"processors", req.url));
 			setTimeout(function(){
 				if (!req.finish){
 					req.finish = true;
 					res.writeHead(500,{'Content-Type': 'text/plain','Content-Length':'Server busy.'.length });
 					res.end('Server busy.');
                    console.log(req.url + "timed out.");
                }
 			},30000);
            processor.process(req,res);
            return;
        }
    }
 	res.writeHead(404,{'Content-Type': 'text/plain','Content-Length':'It\'s not a valid request.'.length});
 	res.end('It\'s not a valid request.');
    console.log(req.url + ' is not a valid request.');
    return;
}).listen(port, host); 

console.log("Server running on " + host + ":" + port + " with appId-"+ conf.appKey
 	+ " and appSecret-" + conf.appSecret);

