let messageNum = 1;
let check = true;
let click = 0;
let c = 1;
let msg = [''];
let inp;
let prx = 0;
let pry = 0;
let showname = false;
let mousemap = [1, 1];
let messageContainer;
let socket;
let sessionCode = null;
let paired = false;

// Drawing state
let currentTool = 'pen';
let currentColor = '#000000';
let drawingHistory = [];
let maxHistory = 50;
let canvasPixels;

// Voice call state
let localStream = null;
let peerConnection = null;
let isVoiceActive = false;

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
    // Prepare canvas inside #canvas-area
    const canvasWrap = document.getElementById('canvas-area');
    const rect = canvasWrap.getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;

    let canvas = createCanvas(width, height);
    canvas.parent('canvas-area');
    canvas.elt.style.position = 'absolute';
    canvas.elt.style.inset = '0';
    
    // Set white background
    background(255);
    
    // Save initial state
    saveDrawingState();

    messageContainer = document.getElementById('messages');
    socket = io.connect('/');
    socket.on('data', processinput);
    socket.on('mouse', drw);
    socket.on('online', upusers);
    socket.on('clearall', clearit);
    socket.on('bucketFill', handleBucketFill);
    socket.on('undo', handleUndo);

    // Voice call events
    socket.on('voiceOffer', handleVoiceOffer);
    socket.on('voiceAnswer', handleVoiceAnswer);
    socket.on('voiceCandidate', handleVoiceCandidate);
    socket.on('voiceEnd', handleVoiceEnd);

    socket.on('sessionJoined', (code) => {
        sessionCode = code;
        document.getElementById('sessionStatus').textContent = 'Session: ' + code;
        console.log('Joined session:', code);
        updateVoiceUI(); // Update voice UI when session changes
    });
    socket.on('paired', () => {
        paired = true;
        document.getElementById('sessionStatus').textContent += ' (Paired!)';
        console.log('Successfully paired!');
        updateVoiceUI(); // Enable voice calls when paired
    });
    socket.on('waitingForPair', () => {
        paired = false;
        document.getElementById('sessionStatus').textContent = 'Waiting for random user...';
        console.log('Waiting for pair...');
        updateVoiceUI(); // Disable voice calls when not paired
    });
    socket.on('sessionFull', (code) => {
        paired = false;
        document.getElementById('sessionStatus').textContent = 'Session ' + code + ' is full!';
        console.log('Session full:', code);
        updateVoiceUI(); // Disable voice calls when session full
    });

    // Session controls
    document.getElementById('pairRandom').onclick = () => {
        socket.emit('pairRandom');
    };
    document.getElementById('joinSession').onclick = () => {
        let code = document.getElementById('sessionCodeInput').value.trim();
        if (code) socket.emit('joinSession', code);
    };

    // Voice call
    document.getElementById('voiceCall').onclick = toggleVoiceCall;

    // Drawing tools
    setupDrawingTools();

    sendButton = document.getElementById('send');
    sendButton.addEventListener('click', send);

    inp = document.getElementById('input');
    inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') send();
    });

    fill(0, 50);
    textSize(22);

    data.name = localStorage.getItem('name');
    if (!data.name) {
        data.name = prompt("Enter a name");
        localStorage.setItem('name', data.name);
    }

    // Toggle view button (no longer needed, but keep for backwards compatibility)
    let toggleBtn = document.getElementById('toggleView');
    if (toggleBtn) {
        toggleBtn.style.display = 'none'; // hide it since we're side by side now
    }

    // update label and online count
    document.getElementById('userLabel').textContent = 'You: ' + data.name;
    
    // Initialize voice UI
    updateVoiceUI();

    // resize handling
    window.addEventListener('resize', () => {
        const r = document.getElementById('canvas-area').getBoundingClientRect();
        resizeCanvas(r.width, r.height);
        background(255);
        redrawCanvas();
    });
}

function processinput(dat, isSent=false) {
    const el = document.createElement('div');
    el.className = 'message';
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = (dat.name || 'U').slice(0,2).toUpperCase();

    const bubble = document.createElement('div');
    bubble.className = 'bubble ' + (isSent ? 'mine' : '');
    
    // Only show name if it's not the current user's message
    if (!isSent) {
        const title = document.createElement('div');
        title.style.fontWeight = '700';
        title.style.fontSize = '12px';
        title.textContent = dat.name || 'Unknown';
        bubble.appendChild(title);
    }
    
    const body = document.createElement('div');
    body.innerHTML = escapeHTML(dat.msg);
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    bubble.appendChild(body);
    bubble.appendChild(meta);

    el.appendChild(avatar);
    el.appendChild(bubble);

    messageContainer.appendChild(el);
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


        processinput(data, true)
        socket.emit('data', data);

        c += 2;

        messageNum += 2;
        msg = data.msg;

        inp.value = "";
    }
}

function send() {
    if (!inp || !inp.value) return;
    data.msg = inp.value;
    processinput(data, true);
    socket.emit('data', data);
    inp.value = '';
}

function clearit() {
    background(255);
    saveDrawingState();
}

function mouseDragged() {
    if (currentTool === 'pen') {
        fill(80, 0, 0);
        mouse = {
            mx: mouseX,
            my: mouseY,
            px: prx,
            py: pry,
            color: currentColor
        };
        strokeWeight(2);
        stroke(currentColor);
        line(mouse.mx, mouse.my, mouse.px, mouse.py);
        strokeWeight(0);
        fill(90);
        prx = mouse.mx;
        pry = mouse.my;
        mouse = normalize(mouse);
        mouse.name = data.name;
        socket.emit('mouse', mouse);
    }
}

function mousePressed() {
    if (currentTool === 'bucket') {
        let x = Math.floor(mouseX);
        let y = Math.floor(mouseY);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            let fillData = {
                x: x / width,
                y: y / height,
                color: currentColor,
                name: data.name
            };
            performBucketFill(x, y, currentColor);
            socket.emit('bucketFill', fillData);
        }
    }
    prx = mouseX;
    pry = mouseY;
}

function mouseReleased() {
    if (currentTool === 'pen') {
        saveDrawingState();
    }
}

function drw(mous) {
    fill(30, 0, 0);
    strokeWeight(2);
    stroke(mous.color || '#ff0000');
    var name = mous.name;
    mous = denormalize(mous);
    line(mous.mx, mous.my, mous.px, mous.py);
    strokeWeight(0);

    //if showname checkbox is checked
    if (showname) {
        mshowname(name);
    }
}

function clearall() {
    background(255);
    messageNum = 1;
    c = 1;
    saveDrawingState();
    socket.emit('clearall');
}

function upusers(no) {
    document.getElementById('onlineCount').textContent = `Online: ${no}`;
}

// Drawing tool functions
function setupDrawingTools() {
    document.getElementById('toolPen').onclick = () => setTool('pen');
    document.getElementById('toolBucket').onclick = () => setTool('bucket');
    document.getElementById('toolUndo').onclick = undoLastAction;
    document.getElementById('toolClear').onclick = clearall;
    document.getElementById('colorPicker').onchange = (e) => {
        currentColor = e.target.value;
    };
}

function setTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tool' + tool.charAt(0).toUpperCase() + tool.slice(1)).classList.add('active');
}

function saveDrawingState() {
    if (drawingHistory.length >= maxHistory) {
        drawingHistory.shift();
    }
    drawingHistory.push(get());
}

function undoLastAction() {
    if (drawingHistory.length > 1) {
        drawingHistory.pop(); // Remove current state
        let previousState = drawingHistory[drawingHistory.length - 1];
        clear();
        background(255);
        image(previousState, 0, 0);
        socket.emit('undo', { name: data.name });
    }
}

function handleUndo(data) {
    // Sync undo with other users
    if (drawingHistory.length > 1) {
        drawingHistory.pop();
        let previousState = drawingHistory[drawingHistory.length - 1];
        clear();
        background(255);
        image(previousState, 0, 0);
    }
}

function performBucketFill(x, y, fillColor) {
    loadPixels();
    
    // Get the color at the clicked position
    let targetR = red(get(x, y));
    let targetG = green(get(x, y));
    let targetB = blue(get(x, y));
    
    // Convert fill color to RGB values
    let fillColorObj = color(fillColor);
    let fillR = red(fillColorObj);
    let fillG = green(fillColorObj);
    let fillB = blue(fillColorObj);
    
    // If target color is same as fill color, don't fill
    if (targetR === fillR && targetG === fillG && targetB === fillB) {
        return;
    }
    
    // Simple flood fill using a queue
    let pixelsToFill = [];
    let visited = new Set();
    pixelsToFill.push([x, y]);
    
    while (pixelsToFill.length > 0) {
        let [currentX, currentY] = pixelsToFill.shift();
        let key = currentX + ',' + currentY;
        
        if (visited.has(key)) continue;
        if (currentX < 0 || currentX >= width || currentY < 0 || currentY >= height) continue;
        
        let currentR = red(get(currentX, currentY));
        let currentG = green(get(currentX, currentY));
        let currentB = blue(get(currentX, currentY));
        
        if (currentR !== targetR || currentG !== targetG || currentB !== targetB) continue;
        
        visited.add(key);
        set(currentX, currentY, fillColorObj);
        
        // Add neighboring pixels
        pixelsToFill.push([currentX + 1, currentY]);
        pixelsToFill.push([currentX - 1, currentY]);
        pixelsToFill.push([currentX, currentY + 1]);
        pixelsToFill.push([currentX, currentY - 1]);
    }
    
    updatePixels();
    saveDrawingState();
}

function handleBucketFill(data) {
    let denormData = {
        x: Math.floor(data.x * width),
        y: Math.floor(data.y * height)
    };
    performBucketFill(denormData.x, denormData.y, data.color);
}

function redrawCanvas() {
    if (drawingHistory.length > 0) {
        let lastState = drawingHistory[drawingHistory.length - 1];
        image(lastState, 0, 0);
    }
}

// Voice call functions
async function toggleVoiceCall() {
    if (!isVoiceActive) {
        await startVoiceCall();
    } else {
        endVoiceCall();
    }
}

async function startVoiceCall() {
    // Check if user is properly paired before starting call
    if (!paired || !sessionCode) {
        alert('You need to be paired with another user before making a voice call!');
        return;
    }
    
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        isVoiceActive = true;
        updateVoiceUI();
        
        await createPeerConnection();
        let offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit('voiceOffer', { offer, sessionCode });
    } catch (err) {
        console.error('Error starting voice call:', err);
        alert('Could not access microphone. Please check permissions.');
        isVoiceActive = false;
        updateVoiceUI();
    }
}

async function createPeerConnection() {
    peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
    
    peerConnection.ontrack = (event) => {
        let remoteAudio = document.createElement('audio');
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.autoplay = true;
        document.body.appendChild(remoteAudio);
    };
    
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('voiceCandidate', { candidate: event.candidate, sessionCode });
        }
    };
}

async function handleVoiceOffer(data) {
    // Only accept voice offers if in the same session
    if (!paired || !sessionCode || data.sessionCode !== sessionCode) {
        return; // Ignore offers from different sessions
    }
    
    if (!isVoiceActive) {
        let accept = confirm('Incoming voice call from your paired user. Accept?');
        if (!accept) return;
        
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            isVoiceActive = true;
            updateVoiceUI();
        } catch (err) {
            console.error('Error accepting call:', err);
            alert('Could not access microphone to accept call.');
            return;
        }
    }
    
    await createPeerConnection();
    await peerConnection.setRemoteDescription(data.offer);
    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('voiceAnswer', { answer, sessionCode });
}

async function handleVoiceAnswer(data) {
    if (peerConnection) {
        await peerConnection.setRemoteDescription(data.answer);
    }
}

async function handleVoiceCandidate(data) {
    if (peerConnection) {
        await peerConnection.addIceCandidate(data.candidate);
    }
}

function endVoiceCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    isVoiceActive = false;
    updateVoiceUI();
    socket.emit('voiceEnd', { sessionCode });
}

function handleVoiceEnd() {
    endVoiceCall();
}

function updateVoiceUI() {
    let indicator = document.getElementById('voiceIndicator');
    let status = document.getElementById('voiceStatus');
    let btn = document.getElementById('voiceCall');
    
    if (!paired || !sessionCode) {
        // Not paired - disable voice call
        indicator.classList.remove('active');
        status.textContent = 'Voice: Need pairing';
        btn.textContent = '📞 Call';
        btn.disabled = true;
        btn.style.opacity = '0.5';
    } else if (isVoiceActive) {
        indicator.classList.add('active');
        status.textContent = 'Voice: On';
        btn.textContent = '📞 End';
        btn.disabled = false;
        btn.style.opacity = '1';
    } else {
        indicator.classList.remove('active');
        status.textContent = 'Voice: Off';
        btn.textContent = '📞 Call';
        btn.disabled = false;
        btn.style.opacity = '1';
    }
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
