const constants = require('./constants');

module.exports = {
    makeBullet: function(player, dst, counter) {
        return new Bullet(player, dst, counter);
    },
    updateBullets: function(bullets) {
        updateBullets(bullets)
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
    var vect = makeUnitVector(player, dst);
    this.x = (player.radius * vect[0]) + player.x;
    this.y = (player.radius * vect[1]) + player.y;
    this.speedX = vect[0];
    this.speedY = vect[1];
    this.speed = 10;
    this.radius = 5;
    this.damage = 5;
    this.updatePos = function() {
        this.x += this.speed * this.speedX;
        this.y += this.speed * this.speedY;
    }
}

function updateBullets(bullets) {
    var toRemove = [];
    for (let id in bullets) {
        bullets[id].updatePos();
        if (offScreen(bullets[id], constants.X_MIN, constants.Y_MIN,
            constants.X_MAX, constants.Y_MAX)) {
            toRemove.push(id);
        }
    }
    for (let id of toRemove) {
        delete bullets[id];
    }
}