let express = require('express');
let online=0;
let app = express();

let server = app.listen(process.env.PORT || 3000);

app.use(express.static('public'));

console.log('RUNING YOUR SERVER ...');
console.log('hearing requests at localhost:3000..');
var socket = require('socket.io');

var io = socket(server);
//this tells it that go to function new connection on new connection 
io.sockets.on('connection', newConnection);
function newConnection(socket) {
	console.log('new connection : ' + socket.id+'  online '+ ++online);
  	io.sockets.emit('online',online);

	socket.on('clearall',()=>{socket.broadcast.emit('clearall')})
		
	socket.on('data', (data) => {
		console.log(data);
		socket.broadcast.emit('data', data);
		//io.sockets.emit('data',datasdggg); }}
	});

	socket.on('mouse', (d) => {
		socket.broadcast.emit('mouse', d);
	});

	socket.on('disconnect', () => {
      		console.log('disconnected now online : '+online);
      		online = online - 1;
      		io.sockets.emit('online',online);
      	});

  	setInterval(() => {
    		socket.emit('online', online);
  	}, 500);
}
