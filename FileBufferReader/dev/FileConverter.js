var FileConverter = {
    ConvertToArrayBuffer: function(object, callback) {
        binarize.pack(object, function(dataView) {
            callback(dataView.buffer);
        });
    },
    ConvertToObject: function(buffer, callback) {
        binarize.unpack(buffer, callback);
    }
};
