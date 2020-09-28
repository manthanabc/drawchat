class buttons
{

	constructor(aname,ax,ay,asizeX,asizeY,funct)
	{
		this.color=(100,100,100,100);
		this.name=aname;
		this.function=funct;
		this.x=ax;
		this.startPressed=0;
		this.y=ay;
		this.color={
			r:100,
			g:100,
			b:100,
			a:100
		}
		this.sizeX=asizeX;
		this.sizeY=asizeY;
		console.log("button created at "+this.x,this.y,this.sizeX,this.sizeY,"with name",this.name);
	}

	update(color={r:100,g:150,b:255,a:255})
	{
		//the main rect of the button

		this.color.r=color.r;
		this.color.g=color.g;
		this.color.b=color.b;
		this.color.a=color.a;

		var timeout=500;
		var pressed=true;

		if(millis() > this.startPressed+timeout)
			pressed = false;

		console.log(pressed);

		if ((mouseX > this.x && mouseY > this.y)&&(mouseX < this.x+this.sizeX &&mouseY < this.y+this.sizeY)){
//this checks if mouse is over this buttons
			console.log("onbutton");
			this.color=
			{
				r:color.r-50 , g:color.g-50 , b:color.b-50,a:255
			}
			//this.update(color);
			if (mouseIsPressed && !pressed) {
				  console.log("starting your function..");
					this.function();
					console.log("started..");
					this.color=color
					this.startPressed=millis();
			}else
				pressed=false;


		}

		push();
		stroke(160);
		strokeWeight(2)
		fill(this.color.r,this.color.g,this.color.b,this.color.a);
		console.log("drew the rectangle")
		rect((width/1.75),height-(height/10),80,20);
		//for(var i =1;i>0;i++){}
		textSize(17);
		fill(130,180, 255);
		strokeWeight(0.5)
		stroke(180);
		text(this.name,this.x+(this.name.length*5),this.y+this.sizeY/1.3);
		fill(0);
		pop();

	}

	setcolor(r=100,g=100,b=100,a=100)
	{
		this.color.r = r ;
		this.color.g = g ;
		this.color.b = b ;
		this.color.a = a ;
	}
}
