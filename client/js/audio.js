const collisionSrc= '../static/audio/Boing.m4a';
const deathSrc = '../static/audio/Death.m4a'
const bulletHitSrc = '../static/audio/Ouch.m4a'
const shotSrc = '../static/audio/Pew.m4a'

function Sound(name, audio) {
    this.name = name;
    this.audio = audio;
}

function soundInit(name, src) {
    var audio = new Audio;
    audio.src = src;
    return new Sound(name, audio);
}

var collisionSound = soundInit('collisionSound', collisionSrc);
var deathSound = soundInit('deathSound', deathSrc);
var bulletHitSound = soundInit('bulletHitSound', bulletHitSrc);
var shotSound = soundInit('shotSound', shotSrc);

function loadSound(sound) {
    if (sound.name == 'shotSound' || sound.name == 'bulletHitSound') {
        let newSound = sound.audio.cloneNode();
        newSound.play();
    } else {
        sound.audio.load();
        sound.audio.play();
    }
}

function playSound(soundNumber) {
    switch (soundNumber) {
        case 0:
                loadSound(deathSound);
                break;
        case 1:
                loadSound(collisionSound);
                break;
        case 2:
                loadSound(bulletHitSound);
                break;
        default:
                loadSound(deathSound);
                break;
    }
}