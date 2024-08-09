c1 = 0;
var check=true;
var click=0;
var c=0;
var msg = [''];
let inp;
var prx=0;
var pry=0;
let showname=false;
var mousemap=[1,1]
var mouse={
	px:0,
	py:0
};
var data = {
	msg: 'connected',
	name: 'UNKNOWN'
};
let button;

function setup() {

	// createCanvas(400, 400);
	createCanvas(min(windowWidth, 760),min(windowHeight, 1080));
	//background(240);
	// you set this to io.connect('localhost:3000')
	//socket = io.connect('https://chattest--manthan2005.repl.co');
	socket = io.connect('http://16.171.198.34:80');
	socket.on('data', todo);
	socket.on('mouse', drw);
  socket.on('online', upusers);
	socket.on('clearall',clearit);
  //socket.on('clearall',clearit);
	// sent=new buttons("send",(width/1.75),height-(height/10),80,20,send);
	//^^^ this is only for testas
	button2 = createButton('send');
	button2.position((width/1.4) - 100,height-(height/10));
	button2.mousePressed(send);

	button = createButton('clear');
	button.position((width/1.4),height-(height/6));
	button.mousePressed(clearit);

	// checkbox = createCheckbox('label', false);
	button.position((width/1.4),height-(height/10));
 //  checkbox.changed(()=>
	// {
	// 	if (showname)
	// 	showname=false;
	// 	else
	// 	showname=true;
	// });

  button = createButton('clear all');
	// button.style('background-color',color(100,100,100	));
	button.position((width/1.4),height-(height/10));
	button.mousePressed(clearall);

	inp = createInput('anonimus');
	inp.elt.className="seloctor"
  console.log(inp)
	inp.position((width/9),height-(height/10),100,100);
	inp.input(myInputEvent);

  fill(0,50);
	textSize(22);
  text(' Draw here ',width/2 -100, height/2);

	fill(20, 200, 250,60);	stroke(20, 200, 250);
	rect(0,height-(height/5),width,height/5);

}

function todo(dat)
{
	text("["+dat.name + ']  ' + dat.msg, 60,(c*10)+20);
	c+=2;
}

function draw()
{
  	fill(0);
	textSize(15);
	stroke(200, 200, 205);
	fill(200, 200, 205);
	// strokeWeight(0.5);
  // text('made by Manthan', 120, 300);
  //stroke(200, 200, 205);
	stroke(20, 200, 250);
	strokeWeight(5);noFill();
	rect(0,0,width,height);
	fill(240);strokeWeight(0);
	rect(0,height-(height/5),width,height/5);
	strokeWeight(5);
	fill(20, 200, 250,60);	stroke(20, 200, 250);
	rect(0,height-(height/5),width,height/5);
	fill(0);strokeWeight(0);stroke(0);
	prx=mouseX;
	pry=mouseY;



	// SENT.update()


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
		c+=2;

		c1+=2;
		return;
		}

		data.msg=inp.elt.value;

		socket.emit('data', data);

		console.log(c + ' you : ' + data.msg + '   u r name ' + data.name);

    text(" [you]  "+data.msg, 200,(c*10)+20);

	  c+=2;

		c1+=2;
		msg = data.msg;
	}
}
function send() {
	let val = random(255);
	entered('Enter');
}

function myInputEvent() {
	console.log('you are typing: ');
	//msg=this.value();
}

function clearit() {
  // background(230);
	c = 1;
  c1=1;
}

function mouseDragged() {
  fill(80, 0, 0);
	mouse = {
		mx: mouseX,
		my: mouseY,
		px:prx,
		py:pry
	};
  strokeWeight(2);
	stroke(0,255,0);
	line(mouse.mx, mouse.my,mouse.px, mouse.py);
	strokeWeight(0);
	console.log("you drew : current:",mouse.mx+","+mouse.my+" previous:"+mouse.px+""+mouse.py)
	fill(90);
	prx=mouse.mx;
	pry=mouse.my;
	mousemap[0]=map(mouse.mx,0,width, )
	mouse=normalize(mouse);
	mouse.name=data.name;
	socket.emit('mouse', mouse);

}

function drw(mous) {

	fill(30, 0, 0);
	strokeWeight(1);
	stroke(255,0,0);
	var name=mous.name;
	mous=denormalize(mous);
	line(mous.mx, mous.my, mous.px,mous.py);
	console.log("someone drew :current:" , mous.mx , mous.my,"prvious :", mous.px,mous.py);

	strokeWeight(0);
	console.log('drawing');

	//if shocheckbox is  cheacked
	if (showname)
	{
		mshowname(name);
	}


}

function clearall(){
background(255);
c1=1;
c=1;
var cn=0;
socket.emit('clearall',cn);
}

function mousePressed(){
 if(click==0)
 {
 //background(230);
 click++;
 }
}

function upusers(no){
  fill(220,220,255);
  stroke(0);
  rect(width-80,(height/2)-14,80,20)
  stroke(1);
  fill(100,100,250);
	textSize(15);
  text(' online '+no,width-80,height/2);
  fill(0);
}

function normalize(mouse)
{

	var nordata =
	{
		mx:mouse.mx/windowWidth,
		my:mouse.my/windowHeight,
		px:mouse.px/windowWidth,
		py:mouse.py/windowHeight
	}
	return nordata

}

function denormalize(data)
{
	var mouse=
	{
			mx:data.mx*windowWidth,
			my:data.my*windowHeight,
			px:data.px*windowWidth,
			py:data.py*windowHeight
	}
	return mouse
}

async function mshowname(name){
	for(var i=255;i>0;i=i-25)
	{
			console.log("rendring"+i);
				fill(180);
				rect((width-80)-10,height/1.5,100,10)

				textSize(10);
				fill(0,0,0,100);
				strokeWeight(0);
				stroke(80,180,100,i);
				text(name+" is drawing",(width-80)-5,(height/1.5)+8);

  }
}
