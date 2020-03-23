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
    this.x = player.x;
    this.y = player.y;
    this.speedX = vect[0];
    this.speedY = vect[1];
    this.speed = 10;
    this.radius = 5;
    this.damage = 5;
    this.updatePos = function() {
        this.x += Math.round(this.speed * this.speedX);
        this.y += Math.round(this.speed * this.speedY);
    }
}

function updateBullets(bullets) {
    var toRemove = [];
    for (let id in bullets) {
        bullets[id][0].updatePos();
        if (offScreen(bullets[id][0], 0, 0, 500, 500)) {
            toRemove.push(id);
        }
    }
    for (let id of toRemove) {
        delete bullets[id];
    }
}