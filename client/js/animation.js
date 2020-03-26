const SPRITE_SIZE = 50;

function Animation(frameSet, delay, spriteSheetLen) {
    // game cycle count since last frame
    this.count = 0;
    // num of game cycles until next frame change
    this.delay = delay;
    // value in sprite sheet to display
    this.frame = 0;
    // current animation index of frame set
    this.frameIndex = 0;
    // array that holds sprite sheet values
    this.frameSet = frameSet;
    this.frameCycle = 0;
    this.animationLen = spriteSheetLen;
    this.stop = false;

    this.change = function (frameSet, delay, spriteLen) {
        if (this.frameSet != frameSet) {
            this.count = 0;
            this.delay = delay;
            this.frameIndex = 0;
            this.frameSet = frameSet;
            this.frame = this.frameSet[this.frameIndex];
            this.animationLen = spriteLen;
        }
    };

    this.update = function () {
        // stop frame
        if (this.frameCycle == this.animationLen) {
            this.stop = true;
        } else {
            this.count++;
            // change frame
            if (this.count >= this.delay) {
                this.count = 0;
                let onLastValue = (this.frameIndex == this.frameSet.length - 1);
                if (onLastValue) {
                    this.frameIndex = 0;
                    this.frameCycle++;
                } else {
                    this.frameIndex++;
                }
                this.frame = this.frameSet[this.frameIndex];
            }
        }
    };
}

var animation = new Animation();

var spriteSheet = new Object();
spriteSheet = {
    frameSets : [[0, 1, 2, 3, 4, 5]],
    image : new Image(),
}
spriteSheet.image.src = '../static/img/explosion.png';

function explosion(ctx, animation, sheet, x, y) {
    if (animation.stop) {
        ctx.fillStyle = '#FFFFFF'; // white
        ctx.fillRect(x, y, 50, 50);
    } else {
        animation.change(sheet.frameSets[0], 12, sheet.frameSets.length);
        ctx.drawImage(sheet.image, animation.frame * SPRITE_SIZE, 0, SPRITE_SIZE,
            SPRITE_SIZE, x, y, SPRITE_SIZE, SPRITE_SIZE);
        animation.update();
    }
}