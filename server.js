var express= require('express');


var app=express();


var server=app.listen(3000);


app.use(express.static('public'));


console.log("RUNING YOUR SERVER ...");

var socket =require('socket.io');

var io = socket(server);

io.sockets.on('connection',newConnection);
function newConnection(socket)
{

	console.log('new connection : '+socket.id);

     socket.on('data',print);



     function print(data){
     console.log(data);
     socket.broadcast.emit('data',data);
     //io.sockets.emit('data',datasdggg); }}
}}
