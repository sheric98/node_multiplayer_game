const constants = require('./constants');
const mapJS = require('./map')
const collJS = require('./collision');
const bulletJS = require('./bullet');
const areaJS = require('./area');
const camJS = require('./camera');
const util = require('./util');
const unitJS = require('./unit');

module.exports = {
    makePlayer: function(id, availablePos) {
        var start = util.getStartingPos(availablePos);
        return new Player(id, start.x, start.y);
    },
    updatePlayers: function(areas, players) {
        updatePlayers(areas, players);
    },
    checkPlayers: function(sockets, areas, players) {
        checkPlayers(sockets, areas, players);
    },
    afterCheckPlayers: function(sockets, areas, players, enemies) {
        afterCheckPlayers(sockets, areas, players, enemies);
    }
};

const RADIUS = constants.PLAYER_RADIUS;

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

function Player(id, startX, startY) {
    this.id = id;
    this.maxHP = 100;
    this.hp = 100;
    this.exp = 0;
    this.expVal = 50;
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
    this.checked = new Set();
    this.bulletHitAudio = false;
    this.enemyImmune = false;
    this.immunityLength = 2;
    this.immunityCounter = 0;
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
        unitJS.borderUpdate(this);
        var ret = unitJS.touchWalls(areas, this, this.oldX, this.oldY);
        this.updateCam();
        return ret;
    }
    this.keydown = function(index) {
        this.keys[index] = true;
    }
    this.keyup = function(index) {
        this.keys[index] = false;
    }
    this.remove = function(areas, players, enemies) {
        for (let bID in this.bullets) {
            this.bullets[bID].remove(areas, players);
        }
        for (let i of this.areas) {
            var area = areas[i];
            for (let eID of area.enemyVisions) {
                var enemy = enemies[eID];
                if (enemy.tracking != null && enemy.tracking.id === this.id) {
                    enemy.tracking = null;
                }
            }
            area.removePlayer(this.id);
        }
        delete players[this.id];
    }
}

function updatePlayers(areas, players) {
    for (let id in players) {
        var player = players[id];
        player.updatePos();
        bulletJS.updateBullets(areas, players, player.bullets);
        if (player.enemyImmune) {
            player.immunityCounter++;
            if (player.immunityCounter == (constants.FPS * player.immunityLength)) {
                player.immunityCounter = 0;
                player.enemyImmune = false;
            }
        }
    }
}

function checkPlayers(sockets, areas, players) {
    var toAdjust = [];
    for (let pID in players) {
        var player = players[pID];
        if (player.checkPos(areas, players)) {
            toAdjust.push(player);
            sockets[pID].emit('playSound', constants.COLLISIONSOUND);
        }
        for (let bID in player.bullets) {
            var bullet = player.bullets[bID];
            bullet.checkPos(areas, players);
        }
    }
    for (let player of toAdjust) {
        areaJS.updatePlayerArea(areas, player);
    }
}

function afterCheckPlayers(sockets, areas, players, enemies) {
    var toRemove = [];
    for (let id in players) {
        var player = players[id];
        player.checked.clear();
        if (player.bulletHitAudio) {
            sockets[id].emit('playSound', constants.BULLETSOUND);
            player.bulletHitAudio = false;
        }
        if (player.hp <= 0) {
            toRemove.push(id);
            sockets[id].emit('playSound', constants.DEATHSOUND);
            sockets[id].emit('dead');
        }
    }
    for (let id of toRemove) {
        players[id].remove(areas, players, enemies);
    }
}