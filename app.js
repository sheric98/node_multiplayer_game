const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const playerJS = require('./js/player');
const bulletJS = require('./js/bullet');
const collJS = require('./js/collision');

app.use(express.static('client'));


app.get('/', function(req, res) {
    res.render('index.html');
});

var sockets = new Object();
var players = new Object();
var bullets = new Object();
var bulletCounter = 0;

io.sockets.on('connection', function(socket) {
    sockets[socket.id] = socket;
    players[socket.id] = playerJS.makePlayer();

    socket.on('disconnect', function() {
        delete sockets[socket.id];
        delete players[socket.id];
    });

    socket.on('keydown', function(index) {
        players[socket.id].keydown(index);
    });

    socket.on('keyup', function(index) {
        players[socket.id].keyup(index);
    });

    socket.on('shoot', function(dst) {
        var player = players[socket.id];
        var bullet = bulletJS.makeBullet(player, dst, bulletCounter);
        bulletCounter++;
        bullets[bullet.id] = [bullet, socket.id];
    });
});

setInterval(sendUpdate, 10);

function sendUpdate() {
    updatePlayers();
    bulletJS.updateBullets(bullets);
    collJS.checkHits(players, bullets);
    io.emit('update', players, bullets);
}

function updatePlayers() {
    var toRemove = [];
    for (let id in players) {
        if (players[id].hp <= 0) {
            toRemove.push(id);
            sockets[id].emit('dead');
        }
        else {
            players[id].updatePos();
        }
    }
    for (let id of toRemove) {
        delete players[id];
    }
}

const server = http.listen(8899, function() {
    console.log('listening on *:8899');
});