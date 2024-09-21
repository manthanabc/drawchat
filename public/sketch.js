let messageNum = 1;
let check = true;
let click = 0;
let c = 1;
let msg = [''];
let inp;
let prx = 0;
let pry = 0;
let showname = false;
let mousemap = [1, 1]
let messageContainer;

let mouse = {
    px: 0,
    py: 0
};
let data = {
    msg: 'connected',
    name: 'UNKNOWN'
};
let button;

function setup() {

    let canvas = createCanvas(min(windowWidth, 784), min(windowHeight, 1000));
    canvas.parent('main-section');
    canvas.elt.style.position = "absolute";
    canvas.elt.style.top = "12px";

    messageContainer = document.getElementById('messages');
    console.log(messageContainer)
    
    socket = io.connect('/');
    socket.on('data', processinput);
    socket.on('mouse', drw);
    socket.on('online', upusers);
    socket.on('clearall', clearit);

    sendButton =  document.getElementById('send');
    sendButton.addEventListener('click', send);

    inp = document.getElementById('input');

    fill(0, 50);
    textSize(22);

    data.name = localStorage.getItem('name');
    if(!data.name) {
        data.name=prompt("Enter a name")
        localStorage.setItem('name', data.name)
    }
}

function processinput(dat) {
      isSent = dat.name == data.name;
      const newMessage = document.createElement('li');
      newMessage.classList.add('message', isSent ? 'sent' : 'received');
      newMessage.innerHTML = `
        <span class="message-username">${dat.name}</span>
        ${escapeHTML(dat.msg)}
        <span class="timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      `;

      messageContainer.appendChild(newMessage);
      messageContainer.scrollTop = messageContainer.scrollHeight;    
}

function escapeHTML (unsafe_str) {
    return unsafe_str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/\'/g, '&#39;')
      .replace(/\//g, '&#x2F;')
}

function draw() {
    fill(0);
    textSize(15);
    stroke(200, 200, 205);
    fill(200, 200, 205);
    // strokeWeight(0.5);
    // text('made by Manthan', 120, 300);
    //stroke(200, 200, 205);
    stroke(20, 200, 250);
    strokeWeight(5);
    noFill();
    fill(240);
    strokeWeight(0);
    // rect(0, height - (height / 5), width, height / 5);
    strokeWeight(5);
    fill(20, 200, 250, 60);
    stroke(20, 200, 250);
    // rect(0, height - (height / 5), width, height / 5);
    fill(0);
    strokeWeight(0);
    stroke(0);
    prx = mouseX;
    pry = mouseY;
}

function keyPressed() {
    entered(key);
}

function entered(key) {
    if (key == 'Enter') {
        if (messageNum === 0) {
            data = {
                name: inp.value
            };
            c += 2;

            messageNum += 2;
            return;
        }

        data.msg = inp.value;


        processinput(data)
        socket.emit('data', data);

        c += 2;

        messageNum += 2;
        msg = data.msg;
    }
}

function send() {
    let val = random(255);
    entered('Enter');
}

function clearit() {
    fill(200, 200, 205);
    c = 1;
    messageNum = 1;
}

function mouseDragged() {
    fill(80, 0, 0);
    mouse = {
        mx: mouseX,
        my: mouseY,
        px: prx,
        py: pry
    };
    strokeWeight(2);
    stroke(0, 255, 0);
    line(mouse.mx, mouse.my, mouse.px, mouse.py);
    strokeWeight(0);
    fill(90);
    prx = mouse.mx;
    pry = mouse.my;
    mousemap[0] = map(mouse.mx, 0, width, )
    mouse = normalize(mouse);
    mouse.name = data.name;
    socket.emit('mouse', mouse);

}

function drw(mous) {

    fill(30, 0, 0);
    strokeWeight(1);
    stroke(255, 0, 0);
    var name = mous.name;
    mous = denormalize(mous);
    line(mous.mx, mous.my, mous.px, mous.py);
    console.log("someone drew :current:", mous.mx, mous.my, "prvious :", mous.px, mous.py);

    strokeWeight(0);
    console.log('drawing');

    //if shocheckbox is  cheacked
    if (showname) {
        mshowname(name);
    }
}

function clearall() {
    background(255);
    messageNum = 1;
    c = 1;
    var cn = 0;
    socket.emit('clearall', cn);
}

function mousePressed() {
    if (click == 0) {
        click++;
    }
}

function upusers(no) {
    fill(220, 220, 255);
    stroke(0);
    rect(width - 80, (height / 2) - 14, 80, 20)
    stroke(1);
    fill(100, 100, 250);
    textSize(15);
    text(' online ' + no, width - 80, height / 2);
    fill(0);
}

function normalize(mouse) {

    var nordata = {
        mx: mouse.mx / windowWidth,
        my: mouse.my / windowHeight,
        px: mouse.px / windowWidth,
        py: mouse.py / windowHeight
    }
    return nordata

}

function denormalize(data) {
    var mouse = {
        mx: data.mx * windowWidth,
        my: data.my * windowHeight,
        px: data.px * windowWidth,
        py: data.py * windowHeight
    }
    return mouse
}

async function mshowname(name) {
    for (var i = 255; i > 0; i = i - 25) {
        console.log("rendring" + i);
        fill(180);
        rect((width - 80) - 10, height / 1.5, 100, 10)

        textSize(10);
        fill(0, 0, 0, 100);
        strokeWeight(0);
        stroke(80, 180, 100, i);
        text(name + " is drawing", (width - 80) - 5, (height / 1.5) + 8);
    }
}
