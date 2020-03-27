const constants = require('./constants');

module.exports = {
    makeCamera: function(player) {
        return new Camera(player);
    }
}

function updateCamera(camera, x, y) {
    camera.x = x - (constants.CAM_WIDTH / 2);
    camera.y = y - (constants.CAM_HEIGHT / 2);
    checkCamera(camera);
}


function checkCamera(camera) {
    if (camera.x < constants.X_MIN) {
        camera.x = constants.X_MIN;
    }
    if (camera.x + constants.CAM_WIDTH > constants.X_MAX) {
        camera.x = constants.X_MAX - constants.CAM_WIDTH;
    }
    if (camera.y < constants.Y_MIN) {
        camera.y = constants.Y_MIN;
    }
    if (camera.y + constants.CAM_HEIGHT > constants.Y_MAX) {
        camera.y = constants.Y_MAX - constants.CAM_HEIGHT;
    }
}


function Camera(player) {
    this.x = 0;
    this.y = 0;
    this.pID = player.id;
    this.update = function(x, y) {
        updateCamera(this, x, y);
    }
    this.update(player.x, player.y);
}