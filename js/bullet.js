const constants = require('./constants');
const collJS = require('./collision');

module.exports = {
    makeBullet: function(player, dst, counter, io) {
        return new Bullet(player, dst, counter, io);
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

function checkBulletWall(bullet, areas, players, io) {
    for (let i of bullet.areas) {
        var area_walls = areas[i].walls;
        for (let wall of area_walls) {
            if (!wall.checkedBullets.has(bullet.id)) {
                wall.checkedPlayers.add(bullet.id);
                if (collJS.circleBoxCollision(bullet, wall)) {
                    bullet.remove(areas, players);
                    if (wall.collapsible) {
                        io.emit('explosion', wall.x, wall.y);
                        wall.collapsible = false;
                    }
                }
            }
        }
    }
}

function Bullet(player, dst, counter, io) {
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
    this.checkPos = function(areas, players) {
        checkBulletWall(this, areas, players, io);
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