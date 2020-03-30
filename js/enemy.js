const util = require('./util');
const collJS = require('./collision');
const unitJS = require('./unit');
const areaJS = require('./area');

var enemyCounter = 0;

module.exports = {
    makeEnemy: function(availPos) {
        var id = 'enemy' + enemyCounter.toString();
        enemyCounter++;
        var startPos = util.getStartingPos(availPos);
        return new Enemy(startPos.x, startPos.y, id);
    },
    updateEnemies: function(areas, players, enemies) {
        updateEnemies(areas, players, enemies);
    },
    checkEnemies: function(areas, enemies) {
        checkEnemies(areas, enemies);
    },
    afterCheckEnemies: function(areas, enemies) {
        afterCheckEnemies(areas, enemies);
    }
}

function checkTracking(areas, enemy, players) {
    var toTrack = [];
    var areasToCheck = enemy.visionAreas;
    for (let i of areasToCheck) {
        var area = areas[i];
        var playersToCheck = area.players;
        for (let pID of playersToCheck) {
            var player = players[pID];
            if (!enemy.checkedVisionPlayers.has(pID)) {
                enemy.checkedVisionPlayers.add(pID);
                if (collJS.circleCollide(enemy, player, enemy.vision, null)) {
                    toTrack.push(player);
                }
            }
        }
    }
    if (toTrack.length > 0) {
        toTrack.sort((a, b) => {
            util.dist(a, enemy) - util.dist(b, enemy);
        });
        enemy.tracking = toTrack[0];
    }
    else {
        enemy.tracking = null;
    }
    enemy.checkedVisionPlayers.clear();
}

function enemyCheckWalls(areas, enemy) {
    var check1 = unitJS.borderUpdate(enemy, true);
    var check2 = unitJS.touchWalls(areas, enemy, enemy.prevX, enemy.prevY, true);
    if (check1 || check2) {
        enemy.stopped = true;
        return true;
    }
    else {
        enemy.stopped = false;
        return false;
    }
}

function isChangeDir(enemy, dir) {
    return (enemy.speedX * dir[0] <= 0) || (enemy.speedY * dir[1] <= 0);
}

function updateSpeed(enemy) {
    if (enemy.tracking != null) {
        var dir = util.makeUnitVector(enemy, enemy.tracking);
        if ((!enemy.stopped) || isChangeDir(enemy, dir)) {
            enemy.speedX = dir[0];
            enemy.speedY = dir[1];
        }
    }
    else {
        if (enemy.stopped) {
            var dir = util.randUnitVector();
            enemy.speedX = dir.x;
            enemy.speedY = dir.y;
        }
    }
}

function Enemy(x, y, id) {
    this.id = id;
    var startDir = util.randUnitVector();
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.maxHP = 50;
    this.hp = 50;
    this.damage = 10;
    this.expVal = 10;
    this.radius = 10;
    this.speed = 2;
    this.speedX = startDir.x;
    this.speedY = startDir.y;
    this.vision = 150;
    this.areas = new Set();
    this.visionAreas = new Set();
    this.stopped = false;
    this.tracking = null;
    this.checkedVisionPlayers = new Set();
    this.checked = new Set();
    this.bulletHitAudio = false;
    this.updatePos = function(areas, players) {
        checkTracking(areas, this, players);
        updateSpeed(this);
        this.prevX = this.x;
        this.prevY = this.y;
        this.x += (this.speed * this.speedX);
        this.y += (this.speed * this.speedY);
    }
    this.checkPos = function(areas) {
        return enemyCheckWalls(areas, this);
    }
    this.remove = function(areas, enemies) {
        for (let i of this.areas) {
            areas[i].removeEnemy(this.id);
        }
        for (let i of this.visionAreas) {
            areas[i].removeEnemyVision(this.id);
        }
        delete enemies[this.id];
    }
}

function updateEnemies(areas, players, enemies) {
    for (let eID in enemies) {
        var enemy = enemies[eID];
        enemy.updatePos(areas, players);
    }
}

function checkEnemies(areas, enemies) {
    var toUpdate = [];
    for (let eID in enemies) {
        var enemy = enemies[eID];
        if (enemy.checkPos(areas)) {
            toUpdate.push(enemy);
        }
    }
    for (let enemy of toUpdate) {
        areaJS.updateEnemyArea(areas, enemy);
    }
}

function afterCheckEnemies(areas, enemies) {
    var toRemove = [];
    for (let eID in enemies) {
        var enemy = enemies[eID];
        enemy.checked.clear();
        if (enemy.hp <= 0) {
            toRemove.push(enemy);
        }
    }
    for (let enemy of toRemove) {
        enemy.remove(areas, enemies);
    }
}