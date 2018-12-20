};

if (typeof module !== 'undefined' /* && !!module.exports*/ ) {
    module.exports = exports = RTCMultiConnection;
}

if (typeof define === 'function' && define.amd) {
    define('RTCMultiConnection', [], function() {
        return RTCMultiConnection;
    });
}
