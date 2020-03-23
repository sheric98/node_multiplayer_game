module.exports = {
    makePlayer: function() {
        var start = getStartingPos();
        return new Player(start.x, start.y);
    }
};

const XWALLS = [0, 500];
const YWALLS = [0, 500];
const RADIUS = 20;

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

function playerWallCollision(player, wall, Xcoord) {
    var coord;
    if (Xcoord) {
        coord = player.x;
    }
    else {
        coord = player.y;
    }
    return [Math.abs(wall - coord) <= player.radius, wall < coord];
}

function Player(startX, startY) {
    this.hp = 100;
    this.x = startX;
    this.y = startY;
    this.speed = 5;
    this.speedX = 0;
    this.speedY = 0;
    this.radius = RADIUS;
    this.keys = [false, false, false, false];
    this.updateSpeed = function() {
        if (this.keys[0] || this.keys[1]) {
            if (this.keys[0] && this.keys[1]) {
                this.speedX = 0;
            }
            else if (this.keys[0]) {
                this.speedX = -1;
            }
            else {
                this.speedX = 1;
            }
        }
        else {
            this.speedX = 0;
        }
        if (this.keys[2] || this.keys[3]) {
            if (this.keys[2] && this.keys[3]) {
                this.speedY = 0;
            }
            else if (this.keys[2]) {
                this.speedY = -1;
            }
            else {
                this.speedY = 1;
            }
        }
        else {
            this.speedY = 0;
        }
    }
    this.updatePos = function() {
        this.updateSpeed();
        this.x += (this.speed * this.speedX);
        this.y += (this.speed * this.speedY);
        for (let xWall of XWALLS) {
            var collideX = playerWallCollision(this, xWall, true);
            if (collideX[0]) {
                var sign = collideX[1] ? 1 : -1;
                this.x = xWall + (sign * this.radius);
                this.speedX = 0;
            }
        }
        for (let yWall of YWALLS) {
            var collideY = playerWallCollision(this, yWall, false);
            if (collideY[0]) {
                var sign = collideY[1] ? 1 : -1;
                this.y = yWall + (sign * this.radius);
                this.speedY = 0;
            }
        }
    }
    this.keydown = function(index) {
        this.keys[index] = true;
    }
    this.keyup = function(index) {
        this.keys[index] = false;
    }
}