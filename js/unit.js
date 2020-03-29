const constants = require('./constants');
const collJS = require('./collision');

module.exports = {
    touchWalls: function(areas, obj, prevX, prevY, convUnit = false) {
        return touchWalls(areas, obj, prevX, prevY, convUnit);
    },
    borderUpdate: function (obj, convUnit = false) {
        return borderUpdate(obj, convUnit);
    }
}

function singleDir(obj, isX) {
    if (isX) {
        if (obj.speedX > 0) {
            obj.speedX = 1;
        }
        else if (obj.speedX < 0) {
            obj.speedX = -1;
        }
    }
    else {
        if (obj.speedY > 0) {
            obj.speedY = 1;
        }
        else if (obj.speedY < 0) {
            obj.speedY = -1;
        }
    }
}


function borderUpdate(obj, convUnit = false) {
    var ret = false;
    if (obj.x - obj.radius <= constants.X_MIN) {
        ret = true;
        obj.x = constants.X_MIN + obj.radius;
        if (convUnit) {
            singleDir(obj, false);
        }
        obj.speedX = 0;
    }
    else if (obj.x + obj.radius >= constants.X_MAX) {
        ret = true;
        obj.x = constants.X_MAX - obj.radius;
        if (convUnit) {
            singleDir(obj, false);
        }
        obj.speedX = 0;
    }
    if (obj.y - obj.radius <= constants.Y_MIN) {
        ret = true;
        obj.y = constants.Y_MIN + obj.radius;
        if (convUnit) {
            singleDir(obj, true);
        }
        obj.speedY = 0;
    }
    else if (obj.y + obj.radius >= constants.Y_MAX) {
        ret = true;
        obj.y = constants.Y_MAX - obj.radius;
        if (convUnit) {
            singleDir(obj, true);
        }
        obj.speedY = 0;
    }
    return ret;
}

function stopPos(obj, collides, old, isX) {
    var lo = 0;
    var hi = obj.speed;
    while (lo != hi && lo != (hi - 1)) {
        mid = Math.floor((lo + hi) / 2);
        if (isX) {
            obj.x += mid * obj.speedX;
            if (collides.some(el => collJS.circleBoxCollision(obj, el))) {
                hi = mid;
            }
            else {
                lo = mid;
            }
            obj.x = old;
        }
        else {
            obj.y += mid * obj.speedY;
            if (collides.some(el => collJS.circleBoxCollision(obj, el))) {
                hi = mid;
            }
            else {
                lo = mid;
            }
            obj.y = old;
        }
    }
    if (isX) {
        obj.x += lo * obj.speedX;
    }
    else {
        obj.y += lo * obj.speedY;
    }
}

function stopSpeed(obj, collides, oldX, oldY, convUnit = false) {
    if (obj.speedX != 0) {
        obj.x += obj.speed * obj.speedX;
        if (collides.some(el => collJS.circleBoxCollision(obj, el))) {
            obj.x = oldX;
            stopPos(obj, collides, oldX, true);
            if (convUnit) {
                singleDir(obj, false);
            }
            obj.speedX = 0;
        }
    }
    if (obj.speedY != 0) {
        obj.y += obj.speed * obj.speedY;
        if (collides.some(el => collJS.circleBoxCollision(obj, el))) {
            obj.y = oldY;
            stopPos(obj, collides, oldY, false);
            if (convUnit) {
                singleDir(obj, true);
            }
            obj.speedY = 0;
        }
    }
}

function touchWalls(areas, obj, oldX, oldY, convUnit = false) {
    var collides = [];
    for (let i of obj.areas) {
        var area_walls = areas[i].walls;
        for (let wall of area_walls) {
            if (!wall.checked.has(obj.id)) {
                wall.checked.add(obj.id);
                if (collJS.circleBoxCollision(obj, wall)) {
                    collides.push(wall);
                }
            }
        }
    }
    if (collides.length > 0) {
        obj.x = oldX;
        obj.y = oldY;
        stopSpeed(obj, collides, oldX, oldY, convUnit);
        return true;
    }
    return false;
}