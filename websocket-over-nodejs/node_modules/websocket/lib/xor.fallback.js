module.exports = {
    xor: function (payload, maskBytes, maskPos) {
        var end = payload.length;
        if (typeof(maskPos) !== 'number') {
            maskPos = 0;
        }
        for (var i=0; i < end; i++) {
            payload[i] = payload[i] ^ maskBytes[maskPos];
            maskPos = (maskPos + 1) & 3;
        }
        return maskPos;
    }
};