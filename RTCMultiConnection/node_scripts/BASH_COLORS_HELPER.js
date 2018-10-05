// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/RTCMultiConnection

// via: stackoverflow.com/a/41407246/552182
var BASH_COLORS_HELPER = {
    getBlackFG: function(str) {
        return '\x1b[30m' + (str || '%s') + '\x1b[0m';
    },
    getRedFG: function(str) {
        return '\x1b[31m' + (str || '%s') + '\x1b[0m';
    },
    getGreenFG: function(str) {
        return '\x1b[32m' + (str || '%s') + '\x1b[0m';
    },
    getYellowFG: function(str) {
        return '\x1b[33m' + (str || '%s') + '\x1b[0m';
    },
    getBlueFG: function() {
        return '\x1b[34m' + (str || '%s') + '\x1b[0m';
    },
    getPinkFG: function(str) {
        return '\x1b[35m' + (str || '%s') + '\x1b[0m';
    },
    getCyanFG: function(str) {
        return '\x1b[36m' + (str || '%s') + '\x1b[0m';
    },
    getWhiteFG: function(str) {
        return '\x1b[37m' + (str || '%s') + '\x1b[0m';
    },
    getCrimsonFG: function(str) {
        return '\x1b[38m' + (str || '%s') + '\x1b[0m';
    },
    underline: function(str) {
        return '\x1b[4m' + (str || '%s') + '\x1b[0m';
    },
    highlight: function(str) {
        return '\x1b[7m' + (str || '%s') + '\x1b[0m';
    },
    getYellowBG: function(str) {
        // Black:40, Red:41, Green:42, Yellow:43, Blue:44, Magenta:45, Cyan:46, White:47, Crimson:48
        return '\x1b[43m' + (str || '%s') + '\x1b[0m';
    },
    getRedBG: function(str) {
        return '\x1b[41m' + (str || '%s') + '\x1b[0m';
    }
};

module.exports = exports = BASH_COLORS_HELPER;
