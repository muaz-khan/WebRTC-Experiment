// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.WebRTC-Experiment.com/licence/
// Source Code   - https://github.com/muaz-khan/Chrome-Extensions

// PixelResolutionMatrix.js

var PixelResolutionMatrix = (function() {
    // http://arkansaspodcastingworkspace.pbworks.com/f/PixelResolutionMatrix.pdf
    var _16x9 = ['240:135', '360:203', '480:272', '640:360', '720:407', '800:450', '1024:580', '1280:720'];
    var _3x2 = ['240:160', '360:240', '480:320', '640:425', '720:480', '800:535', '1024:680', '1280:850'];
    var _4x3 = ['240:180', '360:270', '480:360', '640:480', '720:540', '800:600', '1024:770', '1280:960'];

    // https://en.wikipedia.org/wiki/Display_resolution
    var _16x10 = ['1680:1050', '1440:900', '1280:800'];
    var _5x3 = ['1280:768'];

    // https://en.wikipedia.org/wiki/16:9#Common_resolutions
    var _16x9_2 = ['720:405', '848:480', '960:540', '1024:576', '1366:768', '1600:900', '1920:1080', '2048:1152', '2560:1440', '2880:1620', '3200:1800', '3840:2160', '4096:2304', '5120:2880', '7680:4320', '15360:8640'];
    var _4x3_2 = ['1024:768', '1152:864', '1600:1200'];

    // https://en.wikipedia.org/wiki/List_of_common_resolutions#Computer_graphics
    var _3x2_2 = ['48:32', '60:40', '96:64', '240:160', '480:320', '960:640', '1152:768', '1440:960', '1920:1280', '2160:1440', '2736:1824', '3000:2000'];
    var _8x5 = ['320:200', '640:400', '768:480', '1024:640', '1152:720', '1280:800', '1440:900', '1680:1050', '1920:1200', '2048:1280', '2304:1440', '2560:1600', '2880:1800', '3840:2400', '5120:3200', '7680:4800'];

    // concat
    _16x9 = _16x9.concat(_16x9_2);
    _3x2 = _3x2.concat(_3x2_2);
    _4x3 = _4x3.concat(_4x3_2);

    function isMatched(arr, width, height) {
        var matched = false;
        arr.forEach(function(resolution) {
            resolution = resolution.split(':');
            var w = parseInt(resolution[0]);
            var h = parseInt(resolution[1]);

            if (width == w && height == h) {
                matched = true;
            }
        });
        return matched;
    }

    return {
        getAsepectRatio: function(width, height) {
            width = width || screen.width;
            height = height || screen.height;

            // check if 16:9 matches
            if (isMatched(_16x9, width, height)) {
                return '16:9';
            }

            // check if 4:3 matches
            if (isMatched(_4x3, width, height)) {
                return '4:3';
            }

            // check if 8:5 matches
            if (isMatched(_8x5, width, height)) {
                return '8:5';
            }

            // check if 3:2 matches
            if (isMatched(_3x2, width, height)) {
                return '3:2';
            }

            // check if 16:10 matches
            if (isMatched(_16x10, width, height)) {
                return '16:10';
            }

            // check if 5:3 matches
            if (isMatched(_5x3, width, height)) {
                return '5:3';
            }

            return false;
        }
    }
})();

PixelResolutionMatrix.getAsepectRatio();