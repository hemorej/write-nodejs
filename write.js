var fs = require('fs')
  , diff_match_patch = require('googlediff')
  , express = require('express')
  , xapp =  express()
  , server = require('http').createServer(xapp)
  , io = require('socket.io').listen(server)
  , connect = require('connect')
  , config = require('./config') ;

server.listen(config.node.port) ;
io.set('log level', 1) ;
var clients = {} ;

xapp.configure(function (){
	xapp.use(express.cookieParser());
	xapp.set('view engine', 'jade');
	xapp.set('view options', {layout: false});
}) ;
xapp.use(express.static('static')) ;

xapp.get('/', function (req, res) {
  res.render('index');
});

// io.set('authorization', function (data, accept) {});

io.sockets.on('connection', function (socket) {

	var socketID = socket.id ;
	clients[socketID] = socket ;
	var socket = clients[socketID] ;
	var buffer = '' ;
	
	console.log('connected new client SOCK: '+socketID) ;

	socket.emit('connect', 'you have connected') ;
	socket.on('update', function (data) {
			var dmp = new diff_match_patch() ;
			var patches = dmp.patch_fromText(data);
			var results = dmp.patch_apply(patches, buffer) ;
		if(buffer != results[0]){
			fs.writeFile('__temp'+socketID+'.txt', results[0] , function (err) {});
			buffer = results[0] ;
			socket.emit('updateclient', 'gotcha', data) ;
			console.log('...update from: '+socketID) ;
		}
	});
	socket.on('first', function (data) {
		fs.writeFile('__temp'+socketID+'.txt', data , function (err) {});
		buffer = data ;
	});
	socket.on('disconnect', function () {
		fs.rename('__temp'+socketID+'.txt', 'message_'+socketID+'.txt', function (err) {
			if (err){console.log('temp file with ID: '+socketID+' does not exist');}
			else{console.log('rename complete') ;}
		console.log('disconnected client: '+socketID) ;
		});
	});
});
