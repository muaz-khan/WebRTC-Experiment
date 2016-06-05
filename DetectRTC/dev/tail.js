window.DetectRTC = DetectRTC;

if (typeof module !== 'undefined' /* && !!module.exports*/ ) {
    module.exports = DetectRTC;
}

if (typeof define === 'function' && define.amd) {
    define('DetectRTC', [], function() {
        return DetectRTC;
    });
}
})();
