const mapJS = require('./map');

module.exports = {
    getStartingPos: function(availPos) {
        return getStartingPos(availPos);
    },
    makeUnitVector: function(src, dst) {
        return makeUnitVector(src, dst);
    },
    randUnitVector: function() {
        return randUnitVector();
    },
    dist: function(a, b) {
        return dist(a,b);
    },
    objSize: function(obj) {
        return objSize(obj);
    }
}

function getRandomRange(min, max) {
    var rand = Math.random();
    return Math.round((max - min) * rand) + min;
}

function getStartingPos(availablePos) {
    var len = availablePos.length;
    var startIndex = availablePos[getRandomRange(0, len - 1)];
    var coord = mapJS.indexToCoord(startIndex);
    return {x: coord[0], y: coord[1]};
}

function makeUnitVector(src, dst) {
    var xDir = dst.x - src.x;
    var yDir = dst.y - src.y;
    var length = Math.sqrt((xDir * xDir) + (yDir * yDir));
    xDir /= length;
    yDir /= length;
    return [xDir, yDir];
}

function randUnitVector() {
    var randAng = getRandomRange(0, 2 * Math.PI);
    var xRand = Math.cos(randAng);
    var yRand = Math.sin(randAng);
    return {x: xRand, y: yRand};
}

function dist(a, b) {
    var distX = a.x - b.x;
    var distY = a.y - b.y;
    return Math.sqrt((distX * distX) + (distY * distY));
}

function objSize(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}