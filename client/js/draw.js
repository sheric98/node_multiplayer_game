
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