const constants = require('./constants');

module.exports = {
    makeBullet: function(player, dst, counter) {
        return new Bullet(player, dst, counter);
    },
    updateBullets: function(areas, players, bullets) {
        updateBullets(areas, players, bullets)
    }
}

function makeUnitVector(src, dst) {
    var xDir = dst.x - src.x;
    var yDir = dst.y - src.y;
    var length = Math.sqrt((xDir * xDir) + (yDir * yDir));
    xDir /= length;
    yDir /= length;
    return [xDir, yDir];
}

function offScreen(bullet, minX, minY, maxX, maxY) {
    return (bullet.x < (minX - bullet.radius) ||
        bullet.x > (maxX + bullet.radius) ||
        bullet.y < (minY - bullet.radius) ||
        bullet.y > (maxY + bullet.radius));
}

function Bullet(player, dst, counter) {
    this.id = 'bullet' + counter.toString();
    this.pID = player.id;
    var vect = makeUnitVector(player, dst);
    this.x = (player.radius * vect[0]) + player.x;
    this.y = (player.radius * vect[1]) + player.y;
    this.speedX = vect[0];
    this.speedY = vect[1];
    this.speed = 10;
    this.radius = 5;
    this.damage = 5;
    this.areas = new Set();
    this.updatePos = function() {
        this.x += this.speed * this.speedX;
        this.y += this.speed * this.speedY;
    }
    this.remove = function(areas, players) {
        var player = players[this.pID];
        for (let i of this.areas) {
            areas[i].removeBullet(this.pID, this.id);
        }
        delete player.bullets[this.id];
    }
}

function updateBullets(areas, players, bullets) {
    var toRemove = [];
    for (let id in bullets) {
        bullets[id].updatePos();
        if (offScreen(bullets[id], constants.X_MIN, constants.Y_MIN,
            constants.X_MAX, constants.Y_MAX)) {
            toRemove.push(id);
        }
    }
    for (let id of toRemove) {
        bullets[id].remove(areas, players);
    }
}