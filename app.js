const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const playerJS = require('./js/player');
const bulletJS = require('./js/bullet');
const collJS = require('./js/collision');
const mapJS = require('./js/map')

app.use(express.static('client'));


app.get('/', function(req, res) {
    res.render('index.html');
});

var sockets = new Object();
var players = new Object();
var bulletCounter = 0;

io.sockets.on('connection', function(socket) {
    sockets[socket.id] = socket;
    players[socket.id] = playerJS.makePlayer();

    socket.on('disconnect', function() {
        delete sockets[socket.id];
        delete players[socket.id];
    });

    socket.on('keydown', function(index) {
        if (socket.id in players) {
            players[socket.id].keydown(index);
        }
    });

    socket.on('keyup', function(index) {
        if (socket.id in players) {
            players[socket.id].keyup(index);
        }
    });

    socket.on('shoot', function(dst) {
        if (socket.id in players) {
            var player = players[socket.id];
            var bullet = bulletJS.makeBullet(player, dst, bulletCounter);
            bulletCounter++;
            player.bullets[bullet.id] = bullet;
        }
    });
});

setInterval(sendUpdate, 1000 / 60);

function sendUpdate() {
    updatePlayers();
    collJS.checkHits(players);
    io.emit('update', players);
}

function updatePlayers() {
    var toRemove = [];
    for (let id in players) {
        var player = players[id];
        if (player.hp <= 0) {
            toRemove.push(id);
            sockets[id].emit('dead');
        }
        else {
            player.updatePos();
            bulletJS.updateBullets(player.bullets);
        }
    }
    for (let id of toRemove) {
        delete players[id];
    }
}

const server = http.listen(8899, function() {
    console.log('listening on *:8899');
});