var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));


io.on('connection', function(socket){
	socket.on('disconnect', function(){
		console.log(socket.nickname + ' disconnected');
		if(socket.nickname){
			socket.broadcast.emit('user left', socket.nickname);
		}	
	});
	socket.on('set nickname', function(nickname){
		socket.nickname = nickname;
		io.emit('user joined', nickname);
	});
	socket.on('new message', function(msg){
		console.log('message: ' + msg);
		io.emit('new message', {
			message: msg,
			nickname: socket.nickname
		});
	});
})

http.listen(80, function(){
  console.log('listening on *:80');
});