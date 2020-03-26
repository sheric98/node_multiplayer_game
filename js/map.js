const constants = require('./constants');

module.exports = {
    generateMap: function() {
        return new GameMap();
    },
    makeWalls: function(gamemap) {
        return makeWalls(gamemap);
    },
    resetWallChecks: function(walls) {
        resetWallChecks(walls);
    },
    getAvailablePos: function(walls) {
        return getAvailablePos(walls);
    },
    indexToCoord: function(i) {
        return indexToCoord(i, constants.X_MAX - constants.X_MIN);
    }
};

function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function GameMap() {
    const testMap = [];
    for (let i = 0; i < 100; i++) {
        var rand = Math.random();
        if (rand < constants.WALL_FREQ) {
            testMap.push(0);
        }
        else {
            testMap.push(1);
        }
    }
    return testMap;
}

function Wall(x, y, width, height, collapsible) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.collapsable = collapsible;
    this.checkedPlayers = new Set();
    this.checkedBullets = new Set();
    this.reset = function() {
        this.checkedPlayers.clear();
        this.checkedBullets.clear();
    }
}

function indexToCoord(i, xLen, xMult=1, yMult=1) {
    var xInd = i % xLen;
    var yInd = Math.floor(i / xLen);
    return [xInd * xMult, yInd * yMult];
}

function coordToIndex(x, y, xLen) {
    return (xLen * y) + x;
}

function makeWalls(gamemap) {
    var walls = [];
    gamemap.forEach((tile, i) => {
        if (gamemap[i] == 0) {
            var coord = indexToCoord(i, 10, 50, 50);
            walls.push(new Wall(coord[0], coord[1], 50, 50, true));
        }
    });
    return walls;
}

function resetWallChecks(walls) {
    for (let wall of walls) {
        wall.reset();
    }
}

function removeRectPixels(xMin, xMax, yMin, yMax, xLen, set) {
    for (let x=xMin; x <= xMax; x++) {
        for (let y=yMin; y <= yMax; y++) {
            var i = coordToIndex(x, y, xLen);
            set.delete(i);
        }
    }
}

function removePixelsAroundBorder(xMin, xMax, yMin, yMax, radius, set) {
    var xLen = xMax - xMin;
    var yLen = yMax - yMin;
    removeRectPixels(0, radius, 0, yLen - 1, xLen, set);
    removeRectPixels(xLen - radius - 1, xLen - 1, 0, yLen - 1, xLen, set);
    removeRectPixels(0, xLen - 1, 0, radius, xLen, set);
    removeRectPixels(0, xLen - 1, yLen - radius - 1, yLen - 1, xLen, set);
}

function removePixelsAroundWall(wall, xLen, radius, set) {
    var xMin = wall.x - radius;
    var xMax = wall.x + wall.width + radius;
    var yMin = wall.y - radius;
    var yMax = wall.y + wall.height + radius;

    removeRectPixels(xMin, xMax, yMin, yMax, xLen, set);
}

function getAvailablePos(walls) {
    var xLen = constants.X_MAX - constants.X_MIN;
    var yLen = constants.Y_MAX - constants.Y_MIN;
    var ret = new Set(range(xLen * yLen));
    removePixelsAroundBorder(constants.X_MIN, constants.X_MAX,
        constants.Y_MIN, constants.Y_MAX, constants.PLAYER_RADIUS, ret);
    for (let wall of walls) {
        removePixelsAroundWall(wall, xLen, constants.PLAYER_RADIUS, ret);
    }
    return Array.from(ret);
}