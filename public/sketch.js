var socket;
var c=0;
var msg=[''];
var name="UNKNOWN";
var data;
let button;
function setup()
{
 createCanvas(400,400);
 socket = io.connect('http://localhost:3000');
 socket.on('data',todo);
 console.log("enter name");

 button = createButton('click me');
  button.position(19, 19);
  button.mousePressed(changeBG);
  let inp = createInput('');
 inp.input(myInputEvent);

}


function todo(data){
	console.log(c+" : "+ data.name +" : "+data.msg);
  text(c+' : '+ data.name +' : '+data.msg,0,c*15);
}

function draw()
{
  fill(80,0,0);
  ellipse(mouseX,mouseY,100,50);
  fill(90);
  textSize(12);
//  text('Georgia', 120, 300);

}


function keyPressed()
{entered(key);}
function entered(key){

  if(key=='Enter')
  {
    if(c==0){name=msg.join('');msg = [''];}

     data={
       msg:msg.join(''),
       name:name
           }
        socket.emit('data',data);

      console.log(c+" you : "+msg.join(''));
      msg = [''];
      c++;
  }else{

   append(msg, key);

       }
}
function changeBG() {
  let val = random(255);
  background(val,random(255),random(255));
  entered('enter');
}

function myInputEvent() {
  console.log('you are typing: ', this.value());
}
