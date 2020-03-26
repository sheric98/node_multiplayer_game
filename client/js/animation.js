const SPRITE_SIZE = 50;

function Animation(x, y, frameSet, delay, spriteSheetLen) {
    this.x = x;
    this.y = y;
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
            this.frameCycle = 0;
            this.stop = false;
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

var explosionSheet = new Object();
explosionSheet = {
    frameSets : [[0, 1, 2, 3, 4, 5]],
    image : new Image(),
}
explosionSheet.image.src = '../static/img/explosion.png';

function makeExplosion(x, y, sheet) {
    animation = new Animation();
    animation.x = x;
    animation.y = y;
    animation.change(sheet.frameSets[0], 12, sheet.frameSets.length);
    return animation;
}

function explosion(ctx, anims, sheet) {
    anims.forEach((anim, i) => {
        if (anim.stop) {
            anims.splice(i, 1);
            ctx.fillStyle = '#FFFFFF'; // white
            ctx.fillRect(anim.x, anim.y, SPRITE_SIZE, SPRITE_SIZE);
        } else {
            ctx.drawImage(sheet.image, anim.frame * SPRITE_SIZE, 5, SPRITE_SIZE,
                SPRITE_SIZE, anim.x, anim.y, SPRITE_SIZE, SPRITE_SIZE);
            anim.update();
        }
    });
}