const constants = require('./constants');
const collJS = require('./collision');

module.exports = {
    initAreas: function(walls) {
        return initAreas(walls);
    },
    updateAreas: function(areas, players) {
        updateAreas(areas, players);
    },
    checkAreas: function(areas, players) {
        checkAreas(areas, players);
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

function Area() {
    this.players = new Set();
    this.playerBullets = new Map();
    this.walls = [];
    this.addPlayer = function(id) {
        this.players.add(id);
    }
    this.removePlayer = function(id) {
        this.players.delete(id);
    }
    this.addBullet = function(pID, bID) {
        if (!this.playerBullets.has(pID)) {
            this.playerBullets.set(pID, new Set());
        }
        this.playerBullets.get(pID).add(bID);
    }
    this.removeBullet = function(pID, bID) {
        if (this.playerBullets.has(pID)) {
            var pbSet = this.playerBullets.get(pID);
            pbSet.delete(bID);
            if (pbSet.size == 0) {
                this.playerBullets.delete(pID);
            }
        }
    }
    this.addWall = function(wall) {
        this.walls.push(wall);
    }
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

function circlesToAreas(obj) {
    var x_min = obj.x - obj.radius;
    var x_max = obj.x + obj.radius;
    var y_min = obj.y - obj.radius;
    var y_max = obj.y + obj.radius;

    var x_range = minMaxToIndices(x_min, x_max, true);
    var y_range = minMaxToIndices(y_min, y_max, false);
    return rangesToAreas(x_range, y_range);
}

function updateAdditionObj(areas, obj, players, isPlayer, pID, bID = null) {
    var occupiedAreas = circlesToAreas(obj);
    var noLongerIn = setDiff(obj.areas, occupiedAreas);
    var cameInto = setDiff(occupiedAreas, obj.areas);

    var player = players[pID];

    for (let i of noLongerIn) {
        if (isPlayer) {
            areas[i].removePlayer(pID);
            player.areas.delete(i);
        }
        else {
            areas[i].removeBullet(pID, bID);
            player.bullets[bID].areas.delete(i);
        }
    }

    for (let i of cameInto) {
        if (isPlayer) {
            areas[i].addPlayer(pID);
            player.areas.add(i);
        }
        else {
            areas[i].addBullet(pID, bID);
            player.bullets[bID].areas.add(i);
        }
    }
}

function updateAreas(areas, players) {
    for (let pID in players) {
        var player = players[pID];
        updateAdditionObj(areas, player, players, true, pID);
        for (let bID in player.bullets) {
            var bullet = player.bullets[bID];
            updateAdditionObj(areas, bullet, players, false, pID, bID);
        }
    }
}

function checkAreas(areas, players) {
    for (let area of areas) {
        collJS.checkHits(areas, players, area.players, area.playerBullets);
    }
}