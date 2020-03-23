module.exports = {
    checkHits: function(players, bullets) {
        checkHits(players, bullets);
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

function checkHits(players) {
    var toRemove = new Object();

    for (let id in players) {
        toRemove[id] = [];
    }

    for (let id in players) {
        for (let id2 in players) {
            if (id !== id2) {
                var player = players[id];
                var player2 = players[id2];
                for (let bID in player2.bullets) {
                    var bullet = player2.bullets[bID];
                    if (circleCollide(player, bullet)) {
                        player.hp -= bullet.damage;
                        if (player.hp < 0) {
                            player.hp = 0;
                        }
                        toRemove[id2].push(bID);
                    }
                }
            }
        }
    }
    for (let id in toRemove) {
        for (let bID of toRemove[id]) {
            delete players[id].bullets[bID];
        }
    }
}