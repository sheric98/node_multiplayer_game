const constants = require('./constants');
const collJS = require('./collision');

module.exports = {
    initAreas: function(walls) {
        return initAreas(walls);
    },
    updateAreas: function(areas, players, enemies) {
        updateAreas(areas, players, enemies);
    },
    checkAreas: function(areas, players, enemies) {
        checkAreas(areas, players, enemies);
    },
    updatePlayerArea: function(areas, player) {
        updatePlayerArea(areas, player);
    },
    updateEnemyArea: function(areas, enemy) {
        updateEnemyArea(areas, enemy);
    }
}

const X_SPLITS = constants.X_SPLITS;
const Y_SPLITS = constants.Y_SPLITS;

function genCutoffs(isX) {
    var splits, length, min;
    if (isX) {
        splits = X_SPLITS;
        min = constants.X_MIN;
        length = constants.X_MAX - constants.X_MIN;
    }
    else {
        splits = Y_SPLITS;
        min = constants. Y_MIN;
        length = constants.Y_MAX - constants.Y_MIN;
    }
    var ret = [];
    for (let i = 1; i < splits; i++) {
        ret.push(min + (i * Math.floor(length / splits)));
    }
    return ret;
}

const X_CUTOFFS = genCutoffs(true);
const Y_CUTOFFS = genCutoffs(false);

function appendSets(a, b) {
    b.forEach(a.add, a);
}

function setDiff(a, b) {
    return new Set([...a].filter(x => !b.has(x)));
}

function addPlayer(area, id) {
    area.players.add(id);
}

function removePlayer(area, id) {
    area.players.delete(id);
}

function addBullet(area, pID, bID) {
    if (!area.playerBullets.has(pID)) {
        area.playerBullets.set(pID, new Set());
    }
    area.playerBullets.get(pID).add(bID);
}

function removeBullet(area, pID, bID) {
    if (area.playerBullets.has(pID)) {
        var pbSet = area.playerBullets.get(pID);
        pbSet.delete(bID);
        if (pbSet.size == 0) {
            area.playerBullets.delete(pID);
        }
    }
}

function addEnemy(area, id) {
    area.enemies.add(id);
}

function removeEnemy(area, id) {
    area.enemies.delete(id);
}

function addEnemyVision(area, id) {
    area.enemyVisions.add(id);
}

function removeEnemyVision(area, id) {
    area.enemyVisions.delete(id);
}

var addFunctions = [addPlayer, addBullet, addEnemy, addEnemyVision];
var removeFunctions = [removePlayer, removeBullet, removeEnemy, removeEnemyVision];

function Area() {
    this.players = new Set();
    this.playerBullets = new Map();
    this.walls = [];
    this.enemies = new Set();
    this.enemyVisions = new Set();
    this.addPlayer = function(id) {
        addPlayer(this, id);
    };
    this.removePlayer = function(id) {
        removePlayer(this, id);
    };
    this.addBullet = function(pID, bID) {
        addBullet(this, pID, bID);
    };
    this.removeBullet = function(pID, bID) {
        removeBullet(this, pID, bID);
    };
    this.addWall = function(wall) {
        this.walls.push(wall);
    };
    this.addEnemy = function(id) {
        addEnemy(this, id);
    };
    this.removeEnemy = function(id) {
        removeEnemy(this, id);
    };
    this.addEnemyVision = function(id) {
        addEnemyVision(this, id);
    };
    this.removeEnemyVision = function(id) {
        removeEnemyVision(this, id);
    };
}

function initAreas(walls) {
    var areas = [];
    for (let i = 0; i < (X_SPLITS * Y_SPLITS); i++) {
        areas.push(new Area());
    }
    for (let wall of walls) {
        var occupiedAreas = boxToAreas(wall);
        for (let i of occupiedAreas) {
            areas[i].addWall(wall);
        }
    }
    return areas;
}

function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function coordToIndex(coord, cutoffs) {
    var i;
    for (i = 0; i < cutoffs.length; i++) {
        if (coord <= cutoffs[i]) {
            return i;
        }
    }
    return i;
}

function minMaxToIndices(min, max, isX) {
    var cutoffs = isX ? X_CUTOFFS : Y_CUTOFFS;
    var min_index = coordToIndex(min, cutoffs);
    var max_index = coordToIndex(max, cutoffs);
    return range(max_index - min_index + 1, min_index);
}

function pairToIndex(x_index, y_index) {
    return (y_index * X_SPLITS) + x_index;
}

function rangesToAreas(x_range, y_range) {
    var ret = new Set();
    for (let x of x_range) {
        for (let y of y_range) {
            ret.add(pairToIndex(x, y));
        }
    }
    return ret;
}

function boxToAreas(box) {
    var x_min = box.x;
    var x_max = box.x + box.width;
    var y_min = box.y;
    var y_max = box.y + box.height;

    var x_range = minMaxToIndices(x_min, x_max, true);
    var y_range = minMaxToIndices(y_min, y_max, false);
    return rangesToAreas(x_range, y_range);
}

function circlesToAreas(obj, radius = null) {
    var rad = radius == null ? obj.radius : radius;
    var x_min = obj.x - rad;
    var x_max = obj.x + rad;
    var y_min = obj.y - rad;
    var y_max = obj.y + rad;

    var x_range = minMaxToIndices(x_min, x_max, true);
    var y_range = minMaxToIndices(y_min, y_max, false);
    return rangesToAreas(x_range, y_range);
}

function updateAdditionObj(areas, obj, pID, type, bID = null, radius = null,
    isVision = false) {
    var objAreas = isVision ? obj.visionAreas : obj.areas;
    var occupiedAreas = circlesToAreas(obj, radius);
    var noLongerIn = setDiff(objAreas, occupiedAreas);
    var cameInto = setDiff(occupiedAreas, objAreas);

    for (let i of noLongerIn) {
        if (bID == null) {
            removeFunctions[type](areas[i], pID);
        }
        else {
            removeFunctions[type](areas[i], pID, bID);
        }
        objAreas.delete(i);
    }

    for (let i of cameInto) {
        if (bID == null) {
            addFunctions[type](areas[i], pID);
        }
        else {
            addFunctions[type](areas[i], pID, bID);
        }
        objAreas.add(i);
    }
}

function updateEnemyArea(areas, enemy) {
    updateAdditionObj(areas, enemy, enemy.id, 2);
    updateAdditionObj(areas, enemy, enemy.id, 3, null, enemy.vision, true);
}

function updatePlayerArea(areas, player) {
    updateAdditionObj(areas, player, player.id, 0);
}

function updateAreas(areas, players, enemies) {
    for (let pID in players) {
        var player = players[pID];
        updatePlayerArea(areas, player);
        for (let bID in player.bullets) {
            var bullet = player.bullets[bID];
            updateAdditionObj(areas, bullet, pID, 1, bID);
        }
    }
    for (let eID in enemies) {
        var enemy = enemies[eID];
        updateEnemyArea(areas, enemy);
    }
}

function checkAreas(areas, players, enemies) {
    for (let area of areas) {
        collJS.checkBulletHits(areas, players, players, area.players, area.playerBullets);
        collJS.checkBulletHits(areas, players, enemies, area.enemies, area.playerBullets);
        collJS.checkMeleeHits(players, enemies, area.players, area.enemies);
    }
}