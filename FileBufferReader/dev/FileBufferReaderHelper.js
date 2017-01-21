function FileBufferReaderHelper() {
    var fbrHelper = this;

    function processInWebWorker(_function) {
        var blob = URL.createObjectURL(new Blob([_function.toString(),
            'this.onmessage =  function (e) {' + _function.name + '(e.data);}'
        ], {
            type: 'application/javascript'
        }));

        var worker = new Worker(blob);
        return worker;
    }

    fbrHelper.readAsArrayBuffer = function(fbr, options) {
        var earlyCallback = options.earlyCallback;
        delete options.earlyCallback;

        function processChunk(chunk) {
            if (!fbr.chunks[chunk.uuid]) {
                fbr.chunks[chunk.uuid] = {
                    currentPosition: -1
                };
            }

            options.extra = options.extra || {
                userid: 0
            };

            chunk.userid = options.userid || options.extra.userid || 0;
            chunk.extra = options.extra;

            fbr.chunks[chunk.uuid][chunk.currentPosition] = chunk;

            if (chunk.end && earlyCallback) {
                earlyCallback(chunk.uuid);
                earlyCallback = null;
            }

            // for huge files
            if ((chunk.maxChunks > 200 && chunk.currentPosition == 200) && earlyCallback) {
                earlyCallback(chunk.uuid);
                earlyCallback = null;
            }
        }
        if (false && typeof Worker !== 'undefined') {
            var webWorker = processInWebWorker(fileReaderWrapper);

            webWorker.onmessage = function(event) {
                processChunk(event.data);
            };

            webWorker.postMessage(options);
        } else {
            fileReaderWrapper(options, processChunk);
        }
    };

    function fileReaderWrapper(options, callback) {
        callback = callback || function(chunk) {
            postMessage(chunk);
        };

        var file = options.file;
        if (!file.uuid) {
            file.uuid = (Math.random() * 100).toString().replace(/\./g, '');
        }

        var chunkSize = options.chunkSize || 15 * 1000;
        if (options.extra && options.extra.chunkSize) {
            chunkSize = options.extra.chunkSize;
        }

        var sliceId = 0;
        var cacheSize = chunkSize;

        var chunksPerSlice = Math.floor(Math.min(100000000, cacheSize) / chunkSize);
        var sliceSize = chunksPerSlice * chunkSize;
        var maxChunks = Math.ceil(file.size / chunkSize);

        file.maxChunks = maxChunks;

        var numOfChunksInSlice;
        var currentPosition = 0;
        var hasEntireFile;
        var chunks = [];

        callback({
            currentPosition: currentPosition,
            uuid: file.uuid,
            maxChunks: maxChunks,
            size: file.size,
            name: file.name,
            type: file.type,
            lastModifiedDate: (file.lastModifiedDate || new Date()).toString(),
            start: true
        });

        var blob, reader = new FileReader();

        reader.onloadend = function(evt) {
            if (evt.target.readyState == FileReader.DONE) {
                addChunks(file.name, evt.target.result, function() {
                    sliceId++;
                    if ((sliceId + 1) * sliceSize < file.size) {
                        blob = file.slice(sliceId * sliceSize, (sliceId + 1) * sliceSize);
                        reader.readAsArrayBuffer(blob);
                    } else if (sliceId * sliceSize < file.size) {
                        blob = file.slice(sliceId * sliceSize, file.size);
                        reader.readAsArrayBuffer(blob);
                    } else {
                        file.url = URL.createObjectURL(file);
                        callback({
                            currentPosition: currentPosition,
                            uuid: file.uuid,
                            maxChunks: maxChunks,
                            size: file.size,
                            name: file.name,
                            lastModifiedDate: (file.lastModifiedDate || new Date()).toString(),
                            url: URL.createObjectURL(file),
                            type: file.type,
                            end: true
                        });
                    }
                });
            }
        };

        currentPosition += 1;

        blob = file.slice(sliceId * sliceSize, (sliceId + 1) * sliceSize);
        reader.readAsArrayBuffer(blob);

        function addChunks(fileName, binarySlice, addChunkCallback) {
            numOfChunksInSlice = Math.ceil(binarySlice.byteLength / chunkSize);
            for (var i = 0; i < numOfChunksInSlice; i++) {
                var start = i * chunkSize;
                chunks[currentPosition] = binarySlice.slice(start, Math.min(start + chunkSize, binarySlice.byteLength));

                callback({
                    uuid: file.uuid,
                    buffer: chunks[currentPosition],
                    currentPosition: currentPosition,
                    maxChunks: maxChunks,

                    size: file.size,
                    name: file.name,
                    lastModifiedDate: (file.lastModifiedDate || new Date()).toString(),
                    type: file.type
                });

                currentPosition++;
            }

            if (currentPosition == maxChunks) {
                hasEntireFile = true;
            }

            addChunkCallback();
        }
    }
}
