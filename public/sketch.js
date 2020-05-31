c1 = 0;
var click=0;
var c=0;
var msg = [''];
//var name ;//= 'UNKNOWN';
let inp;
var mouse;
var data = {
	msg: 'connected',
	name: 'unknown'
};
let button;
function setup() {
	createCanvas(400, 400);
	background(220);
	// you set this to io.connect('localhost:3000')
	//socket = io.connect('https://chattest--manthan2005abc.repl.co');
	socket = io.connect('localhost:3000');
	socket.on('data', todo);
	socket.on('mouse', drw);
	socket.on('clearall',clearit);
  //socket.on('clearall',clearit);
	button = createButton('send');
	button.position(width - 100, height - 100);
	button.mousePressed(send);

	button = createButton('clear');
	button.position(width - 100, height - 60);
	button.mousePressed(clearit);

  button = createButton('clear all');
	button.position(width - 170, height - 60);
	button.mousePressed(clearall);

	inp = createInput('send your name first');
	inp.position(width/4,height-(height/10));
	inp.input(myInputEvent);

  fill(0);
	textSize(22);
  text(' Draw here ', 200, 200);


}

function todo(dat)
{
	text("{"+dat.name + '} ' + dat.msg, 60,c*10);
	c+=2;
}

function draw()
{
  fill(0);
	textSize(15);
  text('made by Manthan', 120, 300);
}

function keyPressed()
{
	entered(key);
}

function entered(key)
{
	if (key == 'Enter')
  {
		if (c1 === 0)
    {
		data = {
			name:inp.elt.value
		};
		}

		data.msg=inp.elt.value;

		socket.emit('data', data);

		console.log(c + ' you : ' + data.msg + '   u r name ' + data.name);

    text(" {you} "+data.msg, 200,c*10);

	  c+=2;

		c1+=2;
		msg = data.msg;
	}
}
function send() {
	let val = random(255);
//	background(val, random(255), random(255));
	entered('Enter');
}

function myInputEvent() {
	console.log('you are typing: ');
	//msg=this.value();
}

function clearit() {
  background(255);
	c = 1;
  c1=1;
}
function mouseDragged() {
  fill(80, 0, 0);
	ellipse(mouseX, mouseY, 10, 10);
	fill(90);
	mouse = {
		mx: mouseX,
		my: mouseY
	};

	socket.emit('mouse', mouse);
}

function drw(mous) {
	fill(30, 0, 0);
	ellipse(mous.mx, mous.my, 10, 10);
	console.log('drawing');
}

function clearall(){
background(180);
c1=1;
c=1;
var cn=0;
socket.emit('clearall',cn);
}

function mousePressed(){
 if(click==0)
 {
 background(255);
 click++;
 }
}
