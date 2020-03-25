module.exports = {
    checkHits: function(areas, players, toCheck, pbMap) {
        checkHits(areas, players, toCheck, pbMap);
    }
}

function dist(a, b) {
    var distX = a.x - b.x;
    var distY = a.y - b.y;
    return Math.sqrt((distX * distX) + (distY * distY));
}

function circleCollide(a, b) {
    var thresh = a.radius + b.radius;
    var distance = dist(a, b);
    return distance <= thresh;
}

function checkHits(areas, players, toCheck, playerBulletsMap) {
    var toRemove = new Object();

    for (let id of playerBulletsMap.keys()) {
        toRemove[id] = [];
    }

    for (let id of toCheck) {
        for (let id2 of playerBulletsMap.keys()) {
            if (id !== id2) {
                var player = players[id];
                var player2 = players[id2];
                for (let bID of playerBulletsMap.get(id2)) {
                    var bullet = player2.bullets[bID];
                    if (!player.checkedBullets.has(bID)) {
                        if (circleCollide(player, bullet)) {
                            player.hp -= bullet.damage;
                            if (player.hp < 0) {
                                player.hp = 0;
                            }
                            toRemove[id2].push(bID);
                        }
                        player.checkedBullets.add(bID);
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