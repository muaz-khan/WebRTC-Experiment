function getJsonFile(path) {
    var fs = require('fs');
    var output = {};
    try {
        var json = fs.readFileSync(path);
        output = JSON.parse(json);
    }
    catch(e) {
        output = {};

        // console.log(e.message, e.stack);
    }
    return output;
}

module.exports = exports = getJsonFile;
