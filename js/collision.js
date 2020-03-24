module.exports = {
    checkHits: function (players, bullets) {
        checkHits(players, bullets);
    },
    playerObjectCollision: function (player, gameMap) {
        playerObjectCollision(player, gameMap);
    },
    playerWallCollision: function (player, wall, Xcoord) {
        playerWallCollision(player, wall, Xcoord);
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

function playerHit(player, playerId, bulletArr) {
    return (bulletArr[1] != playerId && circleCollide(player, bulletArr[0]))
}

function checkHits(players, bullets) {
    var toRemove = [];
    for (let id in players) {
        for (let bulletId in bullets) {
            var player = players[id];
            var bulletArr = bullets[bulletId];
            if (playerHit(player, id, bulletArr)) {
                player.hp -= bulletArr[0].damage;
                if (player.hp < 0) {
                    player.hp = 0;
                }
                toRemove.push(bulletId);
            }
        }
    }
    for (let bID of toRemove) {
        delete bullets[bID];
    }
}

function getObjectPos(gameMap) {
    var coordinates = [];
    gameMap.forEach((tile, i) => {
        if (tile == 0) {
            let mult = i % 10 + 1;
            coordinates.push([mult * OBJCENTER[0] - 25,
                Math.floor((i / 10) + 1) * OBJCENTER[1] - 25]);
        }
    });
    return coordinates;
}

function playerObjectCollision(player, gameMap) {
    var coord;
    var coordinates = getObjectPos(gameMap);
    for (let coordinate of coordinates) {
        let coordX = player.x - coordinate[0];
        let coordY = player.y - coordinate[1];
        coord = Math.sqrt(coordX * coordX + coordY * coordY);
        return [coord <= player.radius + OBJCENTER[0], player.x, player.y];
    }
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