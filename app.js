const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const playerJS = require('./js/player');
const bulletJS = require('./js/bullet');
const collJS = require('./js/collision');
const areaJS = require('./js/area');
const mapJS = require('./js/map');
const enemyJS = require('./js/enemy');
const util = require('./js/util');
const constants = require('./js/constants');

app.use(express.static('client'));


app.get('/', function(req, res) {
    res.render('index.html');
});

var sockets = new Object();
var players = new Object();
var spawnParams = {
    cap: 10,
    spawn: constants.ENEMY_SPAWN * constants.FPS,
    spawnCounter: 0,
}
var enemies = new Object();
var bulletCounter = 0;
var gameMap = mapJS.generateMap();
var walls = mapJS.makeWalls(gameMap);
var availPos = mapJS.getAvailablePos(walls);
var areas = areaJS.initAreas(walls);

io.sockets.on('connection', function(socket) {
    sockets[socket.id] = socket;
    players[socket.id] = playerJS.makePlayer(socket.id, availPos);

    socket.on('disconnect', function() {
        delete sockets[socket.id];
        if (players.hasOwnProperty(socket.id)) {
            players[socket.id].remove(areas, players, enemies);
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
            dst.x += player.camera.x;
            dst.y += player.camera.y;
            var bullet = bulletJS.makeBullet(player, dst, bulletCounter, io);
            bulletCounter++;
            player.bullets[bullet.id] = bullet;
        }
    });
});

setInterval(sendUpdate, 1000 / constants.FPS);

function sendUpdate() {
    checkSpawn();
    playerJS.updatePlayers(areas, players);
    enemyJS.updateEnemies(areas, players, enemies);
    areaJS.updateAreas(areas, players, enemies);
    playerJS.checkPlayers(sockets, areas, players);
    enemyJS.checkEnemies(areas, enemies);
    areaJS.checkAreas(areas, players, enemies);
    playerJS.afterCheckPlayers(sockets, areas, players, enemies);
    enemyJS.afterCheckEnemies(areas, enemies);
    mapJS.resetWallChecks(walls);
    io.emit('update', players, enemies, gameMap);
}

function checkSpawn() {
    spawnParams.spawnCounter++;
    if (spawnParams.spawnCounter == spawnParams.spawn) {
        spawnParams.spawnCounter = 0;
        if (util.objSize(enemies) < spawnParams.cap) {
            var enemy = enemyJS.makeEnemy(availPos);
            enemies[enemy.id] = enemy;
        }
    }
}

const server = http.listen(8899, function() {
    console.log('listening on *:8899');
});