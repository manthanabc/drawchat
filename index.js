let express = require('express');
let online = 0;
let waitingUser = null; // For random pairing
let sessions = {}; // sessionCode: [socket1, socket2]
let app = express()

let port = process.env.PORT || 3000
let server = app.listen(port)

app.use(express.static('public'))

console.log('RUNING YOUR SERVER ...')
console.log(`hearing requests at localhost:${port}..`)

let socket = require('socket.io')
let io = socket(server)

io.sockets.on('connection', newConnection)

function newConnection(socket) {
    console.log('new connection : ' + socket.id + '  online ' + ++online)
    io.sockets.emit('online', online)


    // Session code join
    socket.on('joinSession', (code) => {
        console.log('User trying to join session:', code);
        if (!sessions[code]) sessions[code] = [];
        if (sessions[code].length < 2) {
            sessions[code].push(socket);
            socket.sessionCode = code;
            socket.emit('sessionJoined', code);
            console.log('User joined session:', code, 'Total users:', sessions[code].length);
            if (sessions[code].length === 2) {
                console.log('Session full, marking as paired');
                sessions[code][0].emit('paired', true);
                sessions[code][1].emit('paired', true);
            }
        } else {
            socket.emit('sessionFull', code);
        }
    });

    // Random pairing
    socket.on('pairRandom', () => {
        console.log('User requesting random pairing');
        if (waitingUser && waitingUser !== socket && waitingUser.connected) {
            // Pair them
            let code = Math.random().toString(36).substr(2, 6);
            sessions[code] = [waitingUser, socket];
            waitingUser.sessionCode = code;
            socket.sessionCode = code;
            waitingUser.emit('sessionJoined', code);
            socket.emit('sessionJoined', code);
            waitingUser.emit('paired', true);
            socket.emit('paired', true);
            console.log('Random pairing successful with code:', code);
            waitingUser = null;
        } else {
            waitingUser = socket;
            socket.emit('waitingForPair');
            console.log('User waiting for random pair');
        }
    });

    socket.on('clearall', () => {
        if (socket.sessionCode && sessions[socket.sessionCode]) {
            sessions[socket.sessionCode].forEach(s => {
                if (s !== socket) s.emit('clearall');
            });
        } else {
            socket.broadcast.emit('clearall');
        }
    });

    socket.on('data', (data) => {
        console.log('Message from:', data.name, 'in session:', socket.sessionCode);
        if (socket.sessionCode && sessions[socket.sessionCode]) {
            // Only send to other users in the same session (not to sender)
            sessions[socket.sessionCode].forEach(s => {
                if (s !== socket && s.id !== socket.id) {
                    s.emit('data', data);
                }
            });
        } else {
            // Broadcast to all except sender
            socket.broadcast.emit('data', data);
        }
    });

    socket.on('mouse', (d) => {
        if (socket.sessionCode && sessions[socket.sessionCode]) {
            sessions[socket.sessionCode].forEach(s => {
                if (s !== socket) s.emit('mouse', d);
            });
        } else {
            socket.broadcast.emit('mouse', d);
        }
    });

    socket.on('bucketFill', (d) => {
        if (socket.sessionCode && sessions[socket.sessionCode]) {
            sessions[socket.sessionCode].forEach(s => {
                if (s !== socket) s.emit('bucketFill', d);
            });
        } else {
            socket.broadcast.emit('bucketFill', d);
        }
    });

    socket.on('undo', (d) => {
        if (socket.sessionCode && sessions[socket.sessionCode]) {
            sessions[socket.sessionCode].forEach(s => {
                if (s !== socket) s.emit('undo', d);
            });
        } else {
            socket.broadcast.emit('undo', d);
        }
    });

    // Voice call events - only work within paired sessions
    socket.on('voiceOffer', (data) => {
        console.log('Voice offer from session:', data.sessionCode);
        if (socket.sessionCode && sessions[socket.sessionCode] && data.sessionCode === socket.sessionCode) {
            sessions[socket.sessionCode].forEach(s => {
                if (s !== socket && s.id !== socket.id) {
                    s.emit('voiceOffer', data);
                }
            });
        }
    });

    socket.on('voiceAnswer', (data) => {
        console.log('Voice answer from session:', data.sessionCode);
        if (socket.sessionCode && sessions[socket.sessionCode] && data.sessionCode === socket.sessionCode) {
            sessions[socket.sessionCode].forEach(s => {
                if (s !== socket && s.id !== socket.id) {
                    s.emit('voiceAnswer', data);
                }
            });
        }
    });

    socket.on('voiceCandidate', (data) => {
        if (socket.sessionCode && sessions[socket.sessionCode] && data.sessionCode === socket.sessionCode) {
            sessions[socket.sessionCode].forEach(s => {
                if (s !== socket && s.id !== socket.id) {
                    s.emit('voiceCandidate', data);
                }
            });
        }
    });

    socket.on('voiceEnd', (data) => {
        if (socket.sessionCode && sessions[socket.sessionCode]) {
            sessions[socket.sessionCode].forEach(s => {
                if (s !== socket && s.id !== socket.id) {
                    s.emit('voiceEnd', data);
                }
            });
        }
    });


    socket.on('disconnect', () => {
        console.log('disconnected now online : ' + online)
        online = online - 1
        io.sockets.emit('online', online)
        // Remove from session
        if (socket.sessionCode && sessions[socket.sessionCode]) {
            sessions[socket.sessionCode] = sessions[socket.sessionCode].filter(s => s !== socket);
            if (sessions[socket.sessionCode].length === 0) {
                delete sessions[socket.sessionCode];
            }
        }
        if (waitingUser === socket) waitingUser = null;
    })

    setInterval(() => {
        socket.emit('online', online)
    }, 500)
}
