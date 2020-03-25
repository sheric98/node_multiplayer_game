module.exports = {
    generateMap: function () {
        return new GameMap();
    }
};

function GameMap() {
    const testMap = [];
    for (let i = 0; i < 100; i++) {
        testMap.push(1);
    }
    testMap[50] = 0;
    testMap[51] = 0;
    testMap[52] = 0;
    testMap[53] = 0;
    testMap[54] = 0;
    testMap[55] = 0;
    return testMap;
}
