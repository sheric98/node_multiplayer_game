const constants = require('./constants');
const mapJS = require('./map')
const collJS = require('./collision');
const bulletJS = require('./bullet');
const areaJS = require('./area');
const camJS = require('./camera');

module.exports = {
    makePlayer: function(id, availablePos) {
        var start = getStartingPos(availablePos);
        return new Player(id, start.x, start.y);
    },
    updatePlayers: function(sockets, areas, players) {
        updatePlayers(sockets, areas, players);
    },
    checkPlayers: function(sockets, areas, players) {
        checkPlayers(sockets, areas, players);
    }
};

const XWALLS = [constants.X_MIN, constants.X_MAX];
const YWALLS = [constants.Y_MIN, constants.Y_MAX];
const RADIUS = constants.PLAYER_RADIUS;

function getRandomIntRange(min, max) {
    var rand = Math.random();
    return Math.round((max - min) * rand) + min;
}

function getStartingPos(availablePos) {
    var len = availablePos.length;
    var startIndex = availablePos[getRandomIntRange(0, len - 1)];
    var coord = mapJS.indexToCoord(startIndex);
    return {x: coord[0], y: coord[1]};
}

function playerSpeedUpdate(player) {
    if (player.keys[0] || player.keys[1]) {
        if (player.keys[0] && player.keys[1]) {
            player.speedX = 0;
        }
        else if (player.keys[0]) {
            player.speedX = -1;
        }
        else {
            player.speedX = 1;
        }
    }
    else {
        player.speedX = 0;
    }
    if (player.keys[2] || player.keys[3]) {
        if (player.keys[2] && player.keys[3]) {
            player.speedY = 0;
        }
        else if (player.keys[2]) {
            player.speedY = -1;
        }
        else {
            player.speedY = 1;
        }
    }
    else {
        player.speedY = 0;
    }
}

function playerWallUpdate(player) {
    for (let xWall of XWALLS) {
        var collideX = collJS.playerWall(player, xWall, true);
        if (collideX[0]) {
            var sign = collideX[1] ? 1 : -1;
            player.x = xWall + (sign * player.radius);
            player.speedX = 0;
        }
    }
    for (let yWall of YWALLS) {
        var collideY = collJS.playerWall(player, yWall, false);
        if (collideY[0]) {
            var sign = collideY[1] ? 1 : -1;
            player.y = yWall + (sign * player.radius);
            player.speedY = 0;
        }
    }
}

function stopPos(player, collides, old, isX) {
    var lo = 0;
    var hi = player.speed;
    while (lo != hi && lo != (hi - 1)) {
        mid = Math.floor((lo + hi) / 2);
        if (isX) {
            player.x += mid * player.speedX;
            if (collides.some(el => collJS.circleBoxCollision(player, el))) {
                hi = mid;
            }
            else {
                lo = mid;
            }
            player.x = old;
        }
        else {
            player.y += mid * player.speedY;
            if (collides.some(el => collJS.circleBoxCollision(player, el))) {
                hi = mid;
            }
            else {
                lo = mid;
            }
            player.y = old;
        }
    }
    if (isX) {
        player.x += lo * player.speedX;
    }
    else {
        player.y += lo * player.speedY;
    }
}

function stopSpeed(player, collides, oldX, oldY) {
    if (player.speedX != 0) {
        player.x += player.speed * player.speedX;
        if (collides.some(el => collJS.circleBoxCollision(player, el))) {
            player.x = oldX;
            stopPos(player, collides, oldX, true);
            player.speedX = 0;
        }
    }
    if (player.speedY != 0) {
        player.y += player.speed * player.speedY;
        if (collides.some(el => collJS.circleBoxCollision(player, el))) {
            player.y = oldY;
            stopPos(player, collides, oldY, false);
            player.speedY = 0;
        }
    }
}

function playerTouchWalls(areas, player, oldX, oldY) {
    var collides = [];
    for (let i of player.areas) {
        var area_walls = areas[i].walls;
        for (let wall of area_walls) {
            if (!wall.checkedPlayers.has(player.id)) {
                wall.checkedPlayers.add(player.id);
                if (collJS.circleBoxCollision(player, wall)) {
                    collides.push(wall);
                }
            }
        }
    }
    if (collides.length > 0) {
        player.x = oldX;
        player.y = oldY;
        stopSpeed(player, collides, oldX, oldY);
        return true;
    }
    return false;
}

function Player(id, startX, startY) {
    this.id = id;
    this.hp = 100;
    this.x = startX;
    this.y = startY;
    this.oldX = startX;
    this.oldY = startY;
    this.speed = 5;
    this.speedX = 0;
    this.speedY = 0;
    this.radius = RADIUS;
    this.bullets = new Object();
    this.keys = [false, false, false, false];
    this.areas = new Set();
    this.checkedBullets = new Set();
    this.bulletHitAudio = false;
    this.camera = camJS.makeCamera(this);
    this.updateCam = function() {
        this.camera.update(this.x, this.y);
    }
    this.updateSpeed = function() {
        playerSpeedUpdate(this);
    }
    this.updatePos = function() {
        this.updateSpeed();
        this.oldX = this.x;
        this.oldY = this.y;
        this.x += (this.speed * this.speedX);
        this.y += (this.speed * this.speedY);
    }
    this.checkPos = function(areas, players) {
        playerWallUpdate(this);
        var ret = playerTouchWalls(areas, this, this.oldX, this.oldY);
        this.updateCam();
        return ret;
    }
    this.keydown = function(index) {
        this.keys[index] = true;
    }
    this.keyup = function(index) {
        this.keys[index] = false;
    }
    this.remove = function(areas, players) {
        for (let bID in this.bullets) {
            this.bullets[bID].remove(areas, players);
        }
        for (let i of this.areas) {
            areas[i].removePlayer(this.id);
        }
        delete players[this.id];
    }
}

function updatePlayers(sockets, areas, players) {
    var toRemove = [];
    for (let id in players) {
        var player = players[id];
        if (player.bulletHitAudio) {
            sockets[id].emit('playSound', constants.BULLETSOUND);
            player.bulletHitAudio = false;
        }
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

function checkPlayers(sockets, areas, players) {
    var toAdjust = new Object();
    for (let pID in players) {
        var player = players[pID];
        if (player.checkPos(areas, players)) {
            toAdjust[pID] = player;
            sockets[pID].emit('playSound', constants.COLLISIONSOUND);
        }
        for (let bID in player.bullets) {
            var bullet = player.bullets[bID];
            bullet.checkPos(areas, players);
        }
    }
    areaJS.updateAreas(areas, toAdjust);
}