const util = require('./util');

module.exports = {
    checkBulletHits: function(areas, players, fullList, toCheck, pbMap) {
        checkBulletHits(areas, players, fullList, toCheck, pbMap);
    },
    playerWall: function(player, wall, Xcoord) {
        return playerWallCollision(player, wall, Xcoord);
    },
    circleBoxCollision: function(circle, box) {
        return circleBoxCollision(circle, box);
    },
    circleCollide: function(a, b, aRadius, bRadius) {
        return circleCollide(a, b, aRadius, bRadius);
    },
    checkMeleeHits: function(type1, type2, gettingHit, hitting) {
        checkMeleeHits(type1, type2, gettingHit, hitting);
    }
}

function circleCollide(a, b, aRadius = null, bRadius = null) {
    var aRad = aRadius == null ? a.radius : aRadius;
    var bRad = bRadius == null ? b.radius : bRadius;
    var thresh = aRad + bRad;
    var distance = util.dist(a, b);
    return distance <= thresh;
}

function intersectingLines(x1_min, x1_max, x2_min, x2_max) {
    return ((x1_min >= x2_min && x1_min <= x2_max) ||
        (x1_max >= x2_min && x1_max <= x2_max) ||
        (x1_min <= x2_min && x1_max >= x2_max));
}

function boxCollision(x1_min, x1_max, x2_min, x2_max,
    y1_min, y1_max, y2_min, y2_max) {
    return intersectingLines(x1_min, x1_max, x2_min, x2_max) &&
    intersectingLines(y1_min, y1_max, y2_min, y2_max);
}

function closestPointLine(x, xMin, xMax) {
    if (x >= xMin && x <= xMax) {
        return x;
    }
    else if (x < xMin) {
        return xMin;
    }
    else {
        return xMax;
    }
}

function closestPoint(circle, box) {
    var x, y;
    var xMin = box.x;
    var xMax = box.x + box.width;
    var yMin = box.y;
    var yMax = box.y + box.height;

    pointX = closestPointLine(circle.x, xMin, xMax);
    pointY = closestPointLine(circle.y, yMin, yMax);
    return {x: pointX, y: pointY};
}

function circleBoxCollision(circle, box) {
    var closest = closestPoint(circle, box);
    return (util.dist(circle, closest) <= circle.radius);
}

function playerWallCollision(player, wall, Xcoord) {
    var coord;
    if (Xcoord) {
        coord = player.x;
    }
    else {
        coord = player.y;
    }
    return [Math.abs(wall - coord) <= player.radius, wall < coord];
}

function checkBulletHits(areas, players, fullList, toCheck, playerBulletsMap) {
    var toRemove = new Object();

    for (let id of playerBulletsMap.keys()) {
        toRemove[id] = [];
    }

    for (let id of toCheck) {
        for (let id2 of playerBulletsMap.keys()) {
            if (id !== id2) {
                var obj = fullList[id];
                var playerBullet = players[id2];
                for (let bID of playerBulletsMap.get(id2)) {
                    var bullet = playerBullet.bullets[bID];
                    if (!obj.checked.has(bID)) {
                        if (circleCollide(obj, bullet)) {
                            obj.bulletHitAudio = true;
                            obj.hp -= bullet.damage;
                            if (obj.hp < 0) {
                                obj.hp = 0;
                            }
                            if (obj.hp == 0) {
                                playerBullet.exp += obj.expVal;
                            }
                            toRemove[id2].push(bID);
                        }
                        obj.checked.add(bID);
                    }
                }
            }
        }
    }
    for (let id in toRemove) {
        for (let bID of toRemove[id]) {
            players[id].bullets[bID].remove(areas, players);
        }
    }
}

function checkMeleeHits(type1, type2, gettingHit, hitting) {
    for (let id1 of gettingHit) {
        var obj1 = type1[id1];
        if (obj1.enemyImmune) {
            continue;
        }
        for (let id2 of hitting) {
            var obj2 = type2[id2];
            if (!(obj1.checked.has(id2) || obj2.checked.has(id1))) {
                obj1.checked.add(id2);
                obj2.checked.add(id1);
                if (circleCollide(obj1, obj2)) {
                    obj1.hp -= obj2.damage;
                    obj1.enemyImmune = true;
                    if (obj1.hp < 0) {
                        obj1.hp = 0;
                    }
                }
            }
        }
    }
}
