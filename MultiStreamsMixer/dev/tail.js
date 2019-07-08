// for debugging
this.name = 'MultiStreamsMixer';
this.toString = function() {
    return this.name;
};

this.getMixedStream = getMixedStream;

}

if (typeof RecordRTC === 'undefined') {
    if (typeof module !== 'undefined' /* && !!module.exports*/ ) {
        module.exports = MultiStreamsMixer;
    }

    if (typeof define === 'function' && define.amd) {
        define('MultiStreamsMixer', [], function() {
            return MultiStreamsMixer;
        });
    }
}
