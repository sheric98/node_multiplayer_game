const constants = require('./constants');
const mapJS = require('./map')
const collJS = require('./collision');

module.exports = {
    makePlayer: function(id) {
        var start = getStartingPos();
        return new Player(id, start.x, start.y);
    }
};

const XWALLS = [constants.X_MIN, constants.X_MAX];
const YWALLS = [constants.Y_MIN, constants.Y_MAX];
const RADIUS = 20;
var GAMEMAP = mapJS.generateMap();

function getRandomIntRange(min, max) {
    var rand = Math.random();
    return Math.round((max - min) * rand) + min;
}

function getStartingPos() {
    var xRange = [XWALLS[0] + RADIUS, XWALLS[1] - RADIUS];
    var yRange = [YWALLS[0] + RADIUS, YWALLS[1] - RADIUS];
    var xRand = getRandomIntRange(xRange[0], xRange[1]);
    var yRand = getRandomIntRange(yRange[0], yRange[1]);
    return {x: xRand, y: yRand};
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

function Player(id, startX, startY) {
    this.id = id;
    this.hp = 100;
    this.x = startX;
    this.y = startY;
    this.speed = 5;
    this.speedX = 0;
    this.speedY = 0;
    this.radius = RADIUS;
    this.bullets = new Object();
    this.keys = [false, false, false, false];
    this.areas = new Set();
    this.checkedBullets = new Set();
    this.updateSpeed = function() {
        playerSpeedUpdate(this);
    }
    this.updatePos = function() {
        this.updateSpeed();
        this.x += (this.speed * this.speedX);
        this.y += (this.speed * this.speedY);
        playerWallUpdate(this);
        // var objColl = playerObjectCollision(this, GAMEMAP);
        // if (objColl[0]) {
        //     this.speedX = 0;
        //     this.speedY = 0;
        // }
    }
    this.keydown = function(index) {
        this.keys[index] = true;
    }
    this.keyup = function(index) {
        this.keys[index] = false;
    }
    this.remove = function(areas, players) {
        for (let bID in this.bullets) {
            this.bullets[bID].remove();
        }
        for (let i of this.areas) {
            areas[i].removePlayer(this.id);
        }
        delete players[this.id];
    }
}