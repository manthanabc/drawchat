///////here we import modules
var express = require('express');
var online=0;
var app = express();
//listening to local host 3000 
var server = app.listen(3000);

app.use(express.static('public'));

console.log('RUNING YOUR SERVER ...');
console.log('hearing requests at localhost:3000..');
var socket = require('socket.io');

var io = socket(server);
//this tells it that go to function new connection on new connection 
io.sockets.on('connection', newConnection);
function newConnection(socket) {
	console.log('new connection : ' + socket.id+'  online '+online);
  online++;
  io.sockets.emit('online',online);
	socket.on('data', print);
	socket.on('mouse', drw);
	socket.on('clearall',()=>{socket.broadcast.emit('clearall')})
	function print(data) {
		console.log(data);
		socket.broadcast.emit('data', data);
		//io.sockets.emit('data',datasdggg); }}
	}
	function drw(d) {
		console.log('drawing at ',d.mx,d.my,d.name);
		socket.broadcast.emit('mouse', d);
	}


socket.on('disconnect', updatep) ;
function updatep(){

      console.log('disconnected now online : '+online);
      online = online - 1;
      io.sockets.emit('online',online);
      }

  setInterval(function() {
    socket.emit('online', online);
  }, 500);
  }
