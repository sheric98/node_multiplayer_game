module.exports = {
    generateMap: function() {
        return new GameMap();
    },
    makeWalls: function(gamemap) {
        return makeWalls(gamemap);
    },
    resetWallChecks: function(walls) {
        resetWallChecks(walls);
    }
};

function GameMap() {
    const testMap = [];
    for (let i = 0; i < 100; i++) {
        testMap.push(1);
    }
    testMap[13] = 0;
    testMap[50] = 0;
    testMap[51] = 0;
    testMap[52] = 2;
    testMap[53] = 0;
    testMap[54] = 0;
    testMap[55] = 0;
    return testMap;
}


function Wall(x, y, width, height, collapsable) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.collapsable = collapsable;
    this.checkedPlayers = new Set();
    this.checkedBullets = new Set();
    this.reset = function() {
        this.checkedPlayers.clear();
        this.checkedBullets.clear();
    }
}

function indexToCoord(i) {
    xInd = i % 10;
    yInd = Math.floor(i / 10);
    return [xInd * 50, yInd * 50];
}

function makeWalls(gamemap) {
    walls = [];
    gamemap.forEach((tile, i) => {
        if (gamemap[i] == 0) {
            var coord = indexToCoord(i);
            walls.push(new Wall(coord[0], coord[1], 50, 50, false));
        } else if (gamemap[i] == 2) {
            var coord = indexToCoord(i);
            walls.push(new Wall(coord[0], coord[1], 50, 50, true));
        }
    });
    return walls;
}

function resetWallChecks(walls) {
    for (wall of walls) {
        wall.reset();
    }
}