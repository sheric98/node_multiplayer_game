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
    this.width = constants.X_MAX;
    this.height = constants.Y_MAX;
    this.x_tiles = Math.floor(this.width / constants.TILE_X);
    this.y_tiles = Math.floor(this.height / constants.TILE_Y);
    this.tile_width = constants.TILE_X;
    this.tile_height = constants.TILE_Y;
    this.tiles = [];
    for (let i = 0; i < (this.x_tiles * this.y_tiles); i++) {
        var rand = Math.random();
        if (rand < constants.WALL_FREQ) {
            this.tiles.push(0);
        }
        else {
            this.tiles.push(1);
        }
    }
}

function Wall(x, y, width, height, collapsible) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.collapsible = collapsible;
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
    var xLen = gamemap.x_tiles;
    gamemap.tiles.forEach((tile, i) => {
        if (gamemap.tiles[i] == 0) {
            var coord = indexToCoord(i, xLen, constants.TILE_X, constants.TILE_Y);
            walls.push(new Wall(coord[0], coord[1], constants.TILE_X, constants.TILE_Y, true));
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