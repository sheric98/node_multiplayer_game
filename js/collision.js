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