const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const playerJS = require('./js/player');
const bulletJS = require('./js/bullet');
const collJS = require('./js/collision');
const areaJS = require('./js/area');
const mapJS = require('./js/map')

app.use(express.static('client'));


app.get('/', function(req, res) {
    res.render('index.html');
});

var sockets = new Object();
var players = new Object();
var bulletCounter = 0;
var gameMap = mapJS.generateMap();
var walls = mapJS.makeWalls(gameMap);
var areas = areaJS.initAreas(walls);

io.sockets.on('connection', function(socket) {
    sockets[socket.id] = socket;
    players[socket.id] = playerJS.makePlayer(socket.id);
    io.emit('generateMap', gameMap);

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
    playerJS.updatePlayers(sockets, areas, players);
    areaJS.updateAreas(areas, players);
    playerJS.checkPlayers(areas, players);
    areaJS.checkAreas(areas, players);
    mapJS.resetWallChecks(walls);
    io.emit('update', players);
}

const server = http.listen(8899, function() {
    console.log('listening on *:8899');
});