const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const playerJS = require('./js/player');
const bulletJS = require('./js/bullet');
const collJS = require('./js/collision');
const areaJS = require('./js/area');

app.use(express.static('client'));


app.get('/', function(req, res) {
    res.render('index.html');
});

var sockets = new Object();
var players = new Object();
var areas = areaJS.initAreas();
var bulletCounter = 0;

io.sockets.on('connection', function(socket) {
    sockets[socket.id] = socket;
    players[socket.id] = playerJS.makePlayer(socket.id);

    socket.on('disconnect', function() {
        delete sockets[socket.id];
        if (players.hasOwnProperty(socket.id)) { 
            players[socket.id].remove(areas, players);
        }
    });

    socket.on('keydown', function(index) {
        if (players.hasOwnProperty(socket.id)) {
            players[socket.id].keydown(index);
        }
    });

    socket.on('keyup', function(index) {
        if (players.hasOwnProperty(socket.id)) {
            players[socket.id].keyup(index);
        }
    });

    socket.on('shoot', function(dst) {
        if (players.hasOwnProperty(socket.id)) {
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
    areaJS.updateAreas(areas, players);
    areaJS.checkAreas(areas, players);
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
            bulletJS.updateBullets(areas, players, player.bullets);
            player.checkedBullets.clear();
        }
    }
    for (let id of toRemove) {
        players[id].remove(areas, players);
    }
}

const server = http.listen(8899, function() {
    console.log('listening on *:8899');
});