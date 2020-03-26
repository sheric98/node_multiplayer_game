var collisionSound = new Audio;
var deathSound = new Audio;
var bulletHitSound = new Audio;

collisionSound.src = '../static/audio/Boing.m4a';
deathSound.src = '../static/audio/Death.m4a'
bulletHitSound.src = '../static/audio/Ouch.m4a'

function playCollision() {
    collisionSound.play();
}

function playDeath() {
    deathSound.play();
}

function playBulletHit() {
    bulletHitSound.play();
}

function playSound(soundNumber) {
    switch (soundNumber) {
        case 0:
                playDeath();
                break;
        case 1:
                playCollision();
                break;
        case 2:
                playBulletHit();
                break;
        default:
                playDeath();
                break;
    }
}