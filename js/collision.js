module.exports = {
    checkHits: function(areas, players, toCheck, pbMap) {
        checkHits(areas, players, toCheck, pbMap);
    },
    playerWall: function(player, wall, Xcoord) {
        return playerWallCollision(player, wall, Xcoord);
    }
}

// const OBJCENTER = [50, 50];

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

// function getObjectPos(gameMap) {
//     var coordinates = [];
//     gameMap.forEach((tile, i) => {
//         if (tile == 0) {
//             let mult = i % 10 + 1;
//             coordinates.push([mult * OBJCENTER[0] - 25,
//                 Math.floor((i / 10) + 1) * OBJCENTER[1] - 25]);
//         }
//     });
//     return coordinates;
// }
//
// function playerObjectCollision(player, gameMap) {
//     var coord;
//     var coordinates = getObjectPos(gameMap);
//     for (let coordinate of coordinates) {
//         let coordX = player.x - coordinate[0];
//         let coordY = player.y - coordinate[1];
//         coord = Math.sqrt(coordX * coordX + coordY * coordY);
//         return [coord <= player.radius + OBJCENTER[0], player.x, player.y];
//     }
// }

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
