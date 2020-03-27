
const HP_HEIGHT = 2;
const HP_PAD = 5;

function drawObj(ctx, obj, color) {
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawHP(ctx, player) {
    var x = player.x - player.radius;
    var y;
    if (player.y <= (player.radius + HP_HEIGHT + HP_PAD)) {
        y = player.y + player.radius + HP_HEIGHT + HP_PAD;
    }
    else {
        y = player.y - player.radius - HP_HEIGHT - HP_PAD;
    }
    var greenLen = 2 * player.radius * player.hp / 100;
    var redLen = 2 * player.radius - greenLen;
    if (greenLen !== 0) {
        ctx.fillStyle = 'green';
        ctx.fillRect(x, y, greenLen, HP_HEIGHT);
    }
    if (redLen !== 0) {
        ctx.fillStyle = 'red';
        ctx.fillRect(x+greenLen, y, redLen, HP_HEIGHT);
    }
}

function drawMap(background, gameMap) {
    if (background == null) { return; }
    for (var y = 0; y < gameMap.y_tiles; y++) {
        for (var x = 0; x < gameMap.x_tiles; x++) {
            switch (gameMap.tiles[((y * gameMap.x_tiles) + x)]) {
                case 0:
                        background.drawImage(img, x * gameMap.tile_width + 15,
                            y * gameMap.tile_height + 20);
                        break;
                case 2:
                        background.fillStyle = '#FFFFFF'; // white
                        background.fillRect(x * gameMap.tile_width,
                            y * gameMap.tile_height,gameMap.tile_width, gameMap.tile_height);
                        break;
                default:
                        background.fillStyle = '#B0E0E6'; // blue
                        background.fillRect(x * gameMap.tile_width,
                            y * gameMap.tile_height, gameMap.tile_width, gameMap.tile_height);
                        break;
            }
        }
    }
}