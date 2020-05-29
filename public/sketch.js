c1 = 0;
var msg = [''];
var name = 'UNKNOWN';
let inp;
var mouse;
var data = {
	msg: 'connected',
	name: 'unknown'
};
let button;
function setup() {
	createCanvas(400, 400);
	// you set this to io.connect('localhost:3000')
	socket = io.connect('https://chattest--manthan2005abc.repl.co');
	socket.on('data', todo);
	socket.on('mouse', drw);
	console.log('enter name');

	button = createButton('send');
	button.position(width - 100, height - 100);
	button.mousePressed(changeBG);

	button = createButton('clear');
	button.position(width - 100, height - 60);
	button.mousePressed(clear);

	inp = createInput('');
	inp.input(myInputEvent);
}

function todo(dat) {
	console.log(c + ' : ' + dat.name + ' : ' + dat.msg);
	text(c + ' : ' + dat.name + ' : ' + dat.msg, 0, c * 15);
	c++;
}

function draw() {
	fill(80, 0, 0);
	ellipse(mouseX, mouseY, 50, 50);
	fill(90);
	textSize(12);
	//  text('Georgia', 120, 300);
	// console.log(msg +"++++"+ data.msg);
}

function keyPressed() {
	entered(key);
}
function entered(key) {
	if (key == 'Enter') {
		if (c1 == 0) {
			name = inp.elt.value;
		}
		data = {
			msg: inp.elt.value,
			name: name
		};
		socket.emit('data', data);
		console.log(c + ' you : ' + data.msg + '   u r name ' + data.name);

		//  msg = [''];
		c++;
		c1++;
		msg = data.msg;
	}
}
function changeBG() {
	let val = random(255);
	background(val, random(255), random(255));
	entered('Enter');
}

function myInputEvent() {
	console.log('you are typing: ');
	//msg=this.value();
}

function clear() {
	c = 1;
}
function mouseDragged() {
	mouse = {
		mx: mouseX,
		my: mouseY
	};

	socket.emit('mouse', mouse);
}

function drw(mous) {
	fill(30, 0, 0);
	ellipse(mous.mx, mous.my, 50, 50);
	console.log('drawing');
}
