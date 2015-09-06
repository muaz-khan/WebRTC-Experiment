// Last time updated at May 16, 2015, 08:32:23
// Latest file can be found here: https://cdn.webrtc-experiment.com/FileBufferReader.js
// Muaz Khan    - www.MuazKhan.com
// MIT License  - www.WebRTC-Experiment.com/licence
// Source Code  - https://github.com/muaz-khan/FileBufferReader
// Demo         - https://www.WebRTC-Experiment.com/FileBufferReader/
// ___________________
// FileBufferReader.js
// FileBufferReader.js uses binarize.js to convert Objects into array-buffers and vice versa.
// FileBufferReader.js is MIT licensed: www.WebRTC-Experiment.com/licence
// binarize.js is written by @agektmr: https://github.com/agektmr/binarize.js.
/* issues/features need to be fixed & implemented:
-. Fixed issue: https://github.com/muaz-khan/RTCMultiConnection/issues/41
-. Now "ArrayBuffer" is returned instead of "DataView".
-. "onEnd" for sender now having "url" property as well; same as file receiver.
-. "extra" must not be an empty object i.e. {} -because "binarize" fails to parse empty objects.
-. "extra" must not have "date" types; -because "binarize" fails to parse date-types.
*/
(function() {
    window.FileBufferReader = function() {
        var fileBufferReader = this;
        fileBufferReader.chunks = {};

        fileBufferReader.readAsArrayBuffer = function(file, callback, extra) {
            if (!file) {
                console.error('File or Blob is missing.');
                return;
            }

            extra = extra || {};
            extra.chunkSize = extra.chunkSize || 12 * 1000; // Firefox limit is 16k

            File.Read(file, function(args) {
                args = args || {};
                file.extra = extra || {};
                file.url = URL.createObjectURL(file);
                args.file = file; // passed over "onEnd"
                fileBufferReader.chunks[args.uuid] = args;
                callback(args.uuid);
            }, extra);
        };

        fileBufferReader.setMultipleUsers = function(fileUUID, userids) {
            if (!userids || !(userids instanceof Array)) {
                console.error('Exepcted array of user-ids but either NULL or invalid value passed.');
                return;
            }

            var chunks = fileBufferReader.chunks[fileUUID];
            if (!chunks) {
                console.error('No such file exists.');
                return;
            }

            if (!chunks.file) {
                for (var chunk in chunks) {
                    chunks = chunks[chunk];
                    continue;
                }
            } else {
                fileBufferReader.chunks[fileUUID] = {};
            }

            userids.forEach(function(userid) {
                var chk = {};
                for (var c in chunks) {
                    chk[c] = chunks[c];
                }

                var blob = new Blob([chk.file], {
                    type: chk.file.type
                });

                for (var prop in chk.file) {
                    if (!blob[prop]) {
                        blob[prop] = chk.file[prop];
                    }
                }

                fileBufferReader.chunks[fileUUID][userid] = chk;
                fileBufferReader.chunks[fileUUID][userid].file = blob;
            });
        };

        fileBufferReader.getNextChunk = function(uuid, callback, specificUser) {
            if (!uuid) {
                console.error('"uuid" is missing.');
                return;
            }

            var chunks = fileBufferReader.chunks[uuid];
            if (!chunks) return;

            if (specificUser) {
                chunks = chunks[specificUser];
                if (!chunks) return;
            }

            var currentChunk = chunks.listOfChunks[chunks.currentPosition];
            if (!currentChunk) {
                return;
            }

            var isLastChunk = currentChunk.end;

            FileConverter.ConvertToArrayBuffer(currentChunk, function(buffer) {
                if (chunks.currentPosition == 0) {
                    chunks.file.remoteUserId = specificUser || '';
                    fileBufferReader.onBegin(chunks.file);
                }

                if (isLastChunk) {
                    chunks.file.remoteUserId = specificUser || '';
                    fileBufferReader.onEnd(chunks.file);
                }

                callback(buffer, isLastChunk, currentChunk.extra);
                fileBufferReader.onProgress({
                    currentPosition: chunks.currentPosition,
                    maxChunks: chunks.maxChunks,
                    uuid: chunks.uuid,
                    extra: currentChunk.extra,
                    remoteUserId: specificUser || ''
                });

                if (!specificUser) {
                    fileBufferReader.chunks[uuid].currentPosition++;
                    return;
                }
                fileBufferReader.chunks[uuid][specificUser].currentPosition++;
            });
        };

        fileBufferReader.onBegin = fileBufferReader.onProgress = fileBufferReader.onEnd = function() {};

        var receiver = new File.Receiver(fileBufferReader);

        fileBufferReader.addChunk = function(chunk, callback) {
            if (!chunk) {
                console.error('Chunk is missing.');
                return;
            }

            receiver.receive(chunk, function(uuid) {
                FileConverter.ConvertToArrayBuffer({
                    readyForNextChunk: true,
                    uuid: uuid
                }, callback);
            });
        };

        fileBufferReader.convertToObject = FileConverter.ConvertToObject;
        fileBufferReader.convertToArrayBuffer = FileConverter.ConvertToArrayBuffer;
    };

    window.FileSelector = function() {
        var selector = this;

        selector.selectSingleFile = selectFile;
        selector.selectMultipleFiles = function(callback) {
            selectFile(callback, true);
        };

        function selectFile(callback, multiple) {
            var file = document.createElement('input');
            file.type = 'file';

            if (multiple) {
                file.multiple = true;
            }

            file.onchange = function() {
                if (multiple) {
                    if (!file.files.length) {
                        console.error('No file selected.');
                        return;
                    }
                    callback(file.files);
                    return;
                }

                if (!file.files[0]) {
                    console.error('No file selected.');
                    return;
                }

                callback(file.files[0]);
            };
            fireClickEvent(file);
        }

        function fireClickEvent(element) {
            var evt = new window.MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });

            element.dispatchEvent(evt);
        }
    };

    var File = {
        Read: function(file, callback, extra) {
            extra = extra || {};

            var numOfChunksInSlice;
            var currentPosition = 1;
            var hasEntireFile;
            var listOfChunks = {};

            var chunkSize = extra.chunkSize || 60 * 1000; // 64k max sctp limit (AFAIK!)

            var sliceId = 0;
            var cacheSize = chunkSize;

            var chunksPerSlice = Math.floor(Math.min(100000000, cacheSize) / chunkSize);
            var sliceSize = chunksPerSlice * chunkSize;
            var maxChunks = Math.ceil(file.size / chunkSize);

            // uuid is used to uniquely identify sending instance
            var uuid = file.uuid || (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '-');

            listOfChunks[0] = {
                uuid: uuid,
                maxChunks: maxChunks,
                size: file.size,
                name: file.name,
                lastModifiedDate: file.lastModifiedDate + '',
                type: file.type,
                start: true,
                extra: extra
            };

            file.maxChunks = maxChunks;
            file.uuid = uuid;

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
                            listOfChunks[currentPosition] = {
                                uuid: uuid,
                                maxChunks: maxChunks,
                                size: file.size,
                                name: file.name,
                                lastModifiedDate: file.lastModifiedDate + '',
                                type: file.type,
                                end: true,
                                extra: extra
                            };
                            callback({
                                currentPosition: 0,
                                listOfChunks: listOfChunks,
                                maxChunks: maxChunks + 1,
                                uuid: uuid,
                                extra: extra
                            });
                        }
                    });
                }
            };

            blob = file.slice(sliceId * sliceSize, (sliceId + 1) * sliceSize);
            reader.readAsArrayBuffer(blob);

            function addChunks(fileName, binarySlice, callback00) {
                numOfChunksInSlice = Math.ceil(binarySlice.byteLength / chunkSize);
                for (var i = 0; i < numOfChunksInSlice; i++) {
                    var start = i * chunkSize;
                    listOfChunks[currentPosition] = {
                        uuid: uuid,
                        value: binarySlice.slice(start, Math.min(start + chunkSize, binarySlice.byteLength)),
                        currentPosition: currentPosition,
                        maxChunks: maxChunks,
                        extra: extra
                    };

                    currentPosition++;
                }

                if (currentPosition == maxChunks) {
                    hasEntireFile = true;
                }

                callback00();
            }
        },

        Receiver: function(config) {
            var packets = {};

            function receive(chunk, callback) {
                if (!chunk.uuid) {
                    FileConverter.ConvertToObject(chunk, function(object) {
                        receive(object);
                    });
                    return;
                }

                if (chunk.start && !packets[chunk.uuid]) {
                    packets[chunk.uuid] = [];
                    if (config.onBegin) config.onBegin(chunk);
                }

                if (!chunk.end && chunk.value) {
                    packets[chunk.uuid].push(chunk.value);
                }

                if (chunk.end) {
                    var _packets = packets[chunk.uuid];
                    var finalArray = [],
                        length = _packets.length;

                    for (var i = 0; i < length; i++) {
                        if (!!_packets[i]) {
                            finalArray.push(_packets[i]);
                        }
                    }

                    var blob = new Blob(finalArray, {
                        type: chunk.type
                    });
                    blob = merge(blob, chunk);
                    blob.url = URL.createObjectURL(blob);
                    blob.uuid = chunk.uuid;

                    if (!blob.size) console.error('Something went wrong. Blob Size is 0.');

                    if (config.onEnd) config.onEnd(blob);
                }

                if (chunk.value && config.onProgress) config.onProgress(chunk);

                if (!chunk.end) callback(chunk.uuid);
            }

            return {
                receive: receive
            };
        },
        SaveToDisk: function(fileUrl, fileName) {
            var hyperlink = document.createElement('a');
            hyperlink.href = fileUrl;
            hyperlink.target = '_blank';
            hyperlink.download = fileName || fileUrl;

            var mouseEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });

            hyperlink.dispatchEvent(mouseEvent);
            (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
        }
    };

    // ________________
    // FileConverter.js
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

    function merge(mergein, mergeto) {
        if (!mergein) mergein = {};
        if (!mergeto) return mergein;

        for (var item in mergeto) {
            mergein[item] = mergeto[item];
        }
        return mergein;
    }

    /*
    Copyright 2013 Eiji Kitamura

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

    Author: Eiji Kitamura (agektmr@gmail.com)
    */
    (function(root) {
        var debug = false;

        var BIG_ENDIAN = false,
            LITTLE_ENDIAN = true,
            TYPE_LENGTH = Uint8Array.BYTES_PER_ELEMENT,
            LENGTH_LENGTH = Uint16Array.BYTES_PER_ELEMENT,
            BYTES_LENGTH = Uint32Array.BYTES_PER_ELEMENT;

        var Types = {
            NULL: 0,
            UNDEFINED: 1,
            STRING: 2,
            NUMBER: 3,
            BOOLEAN: 4,
            ARRAY: 5,
            OBJECT: 6,
            INT8ARRAY: 7,
            INT16ARRAY: 8,
            INT32ARRAY: 9,
            UINT8ARRAY: 10,
            UINT16ARRAY: 11,
            UINT32ARRAY: 12,
            FLOAT32ARRAY: 13,
            FLOAT64ARRAY: 14,
            ARRAYBUFFER: 15,
            BLOB: 16,
            FILE: 16,
            BUFFER: 17 // Special type for node.js
        };

        if (debug) {
            var TypeNames = [
                'NULL',
                'UNDEFINED',
                'STRING',
                'NUMBER',
                'BOOLEAN',
                'ARRAY',
                'OBJECT',
                'INT8ARRAY',
                'INT16ARRAY',
                'INT32ARRAY',
                'UINT8ARRAY',
                'UINT16ARRAY',
                'UINT32ARRAY',
                'FLOAT32ARRAY',
                'FLOAT64ARRAY',
                'ARRAYBUFFER',
                'BLOB',
                'BUFFER'
            ];
        }

        var Length = [
            null, // Types.NULL
            null, // Types.UNDEFINED
            'Uint16', // Types.STRING
            'Float64', // Types.NUMBER
            'Uint8', // Types.BOOLEAN
            null, // Types.ARRAY
            null, // Types.OBJECT
            'Int8', // Types.INT8ARRAY
            'Int16', // Types.INT16ARRAY
            'Int32', // Types.INT32ARRAY
            'Uint8', // Types.UINT8ARRAY
            'Uint16', // Types.UINT16ARRAY
            'Uint32', // Types.UINT32ARRAY
            'Float32', // Types.FLOAT32ARRAY
            'Float64', // Types.FLOAT64ARRAY
            'Uint8', // Types.ARRAYBUFFER
            'Uint8', // Types.BLOB, Types.FILE
            'Uint8' // Types.BUFFER
        ];

        var binary_dump = function(view, start, length) {
            var table = [],
                endianness = BIG_ENDIAN,
                ROW_LENGTH = 40;
            table[0] = [];
            for (var i = 0; i < ROW_LENGTH; i++) {
                table[0][i] = i < 10 ? '0' + i.toString(10) : i.toString(10);
            }
            for (i = 0; i < length; i++) {
                var code = view.getUint8(start + i, endianness);
                var index = ~~(i / ROW_LENGTH) + 1;
                if (typeof table[index] === 'undefined') table[index] = [];
                table[index][i % ROW_LENGTH] = code < 16 ? '0' + code.toString(16) : code.toString(16);
            }
            console.log('%c' + table[0].join(' '), 'font-weight: bold;');
            for (i = 1; i < table.length; i++) {
                console.log(table[i].join(' '));
            }
        };

        var find_type = function(obj) {
            var type = undefined;

            if (obj === undefined) {
                type = Types.UNDEFINED;

            } else if (obj === null) {
                type = Types.NULL;

            } else {
                var const_name = obj.constructor.name;
                if (const_name !== undefined) {
                    // return type by .constructor.name if possible
                    type = Types[const_name.toUpperCase()];

                } else {
                    // Work around when constructor.name is not defined
                    switch (typeof obj) {
                        case 'string':
                            type = Types.STRING;
                            break;

                        case 'number':
                            type = Types.NUMBER;
                            break;

                        case 'boolean':
                            type = Types.BOOLEAN;
                            break;

                        case 'object':
                            if (obj instanceof Array) {
                                type = Types.ARRAY;

                            } else if (obj instanceof Int8Array) {
                                type = Types.INT8ARRAY;

                            } else if (obj instanceof Int16Array) {
                                type = Types.INT16ARRAY;

                            } else if (obj instanceof Int32Array) {
                                type = Types.INT32ARRAY;

                            } else if (obj instanceof Uint8Array) {
                                type = Types.UINT8ARRAY;

                            } else if (obj instanceof Uint16Array) {
                                type = Types.UINT16ARRAY;

                            } else if (obj instanceof Uint32Array) {
                                type = Types.UINT32ARRAY;

                            } else if (obj instanceof Float32Array) {
                                type = Types.FLOAT32ARRAY;

                            } else if (obj instanceof Float64Array) {
                                type = Types.FLOAT64ARRAY;

                            } else if (obj instanceof ArrayBuffer) {
                                type = Types.ARRAYBUFFER;

                            } else if (obj instanceof Blob) { // including File
                                type = Types.BLOB;

                            } else if (obj instanceof Buffer) { // node.js only
                                type = Types.BUFFER;

                            } else if (obj instanceof Object) {
                                type = Types.OBJECT;

                            }
                            break;

                        default:
                            break;
                    }
                }
            }
            return type;
        };

        var utf16_utf8 = function(string) {
            return unescape(encodeURIComponent(string));
        };

        var utf8_utf16 = function(bytes) {
            return decodeURIComponent(escape(bytes));
        };

        /**
         * packs seriarized elements array into a packed ArrayBuffer
         * @param  {Array} serialized Serialized array of elements.
         * @return {DataView} view of packed binary
         */
        var pack = function(serialized) {
            var cursor = 0,
                i = 0,
                j = 0,
                endianness = BIG_ENDIAN;

            var ab = new ArrayBuffer(serialized[0].byte_length + serialized[0].header_size);
            var view = new DataView(ab);

            for (i = 0; i < serialized.length; i++) {
                var start = cursor,
                    header_size = serialized[i].header_size,
                    type = serialized[i].type,
                    length = serialized[i].length,
                    value = serialized[i].value,
                    byte_length = serialized[i].byte_length,
                    type_name = Length[type],
                    unit = type_name === null ? 0 : root[type_name + 'Array'].BYTES_PER_ELEMENT;

                // Set type
                if (type === Types.BUFFER) {
                    // on node.js Blob is emulated using Buffer type
                    view.setUint8(cursor, Types.BLOB, endianness);
                } else {
                    view.setUint8(cursor, type, endianness);
                }
                cursor += TYPE_LENGTH;

                if (debug) {
                    console.info('Packing', type, TypeNames[type]);
                }

                // Set length if required
                if (type === Types.ARRAY || type === Types.OBJECT) {
                    view.setUint16(cursor, length, endianness);
                    cursor += LENGTH_LENGTH;

                    if (debug) {
                        console.info('Content Length', length);
                    }
                }

                // Set byte length
                view.setUint32(cursor, byte_length, endianness);
                cursor += BYTES_LENGTH;

                if (debug) {
                    console.info('Header Size', header_size, 'bytes');
                    console.info('Byte Length', byte_length, 'bytes');
                }

                switch (type) {
                    case Types.NULL:
                    case Types.UNDEFINED:
                        // NULL and UNDEFINED doesn't have any payload
                        break;

                    case Types.STRING:
                        if (debug) {
                            console.info('Actual Content %c"' + value + '"', 'font-weight:bold;');
                        }
                        for (j = 0; j < length; j++, cursor += unit) {
                            view.setUint16(cursor, value.charCodeAt(j), endianness);
                        }
                        break;

                    case Types.NUMBER:
                    case Types.BOOLEAN:
                        if (debug) {
                            console.info('%c' + value.toString(), 'font-weight:bold;');
                        }
                        view['set' + type_name](cursor, value, endianness);
                        cursor += unit;
                        break;

                    case Types.INT8ARRAY:
                    case Types.INT16ARRAY:
                    case Types.INT32ARRAY:
                    case Types.UINT8ARRAY:
                    case Types.UINT16ARRAY:
                    case Types.UINT32ARRAY:
                    case Types.FLOAT32ARRAY:
                    case Types.FLOAT64ARRAY:
                        var _view = new Uint8Array(view.buffer, cursor, byte_length);
                        _view.set(new Uint8Array(value.buffer));
                        cursor += byte_length;
                        break;

                    case Types.ARRAYBUFFER:
                    case Types.BUFFER:
                        var _view = new Uint8Array(view.buffer, cursor, byte_length);
                        _view.set(new Uint8Array(value));
                        cursor += byte_length;
                        break;

                    case Types.BLOB:
                    case Types.ARRAY:
                    case Types.OBJECT:
                        break;

                    default:
                        throw 'TypeError: Unexpected type found.';
                }

                if (debug) {
                    binary_dump(view, start, cursor - start);
                }
            }

            return view;
        };

        /**
         * Unpack binary data into an object with value and cursor
         * @param  {DataView} view [description]
         * @param  {Number} cursor [description]
         * @return {Object}
         */
        var unpack = function(view, cursor) {
            var i = 0,
                endianness = BIG_ENDIAN,
                start = cursor;
            var type, length, byte_length, value, elem;

            // Retrieve "type"
            type = view.getUint8(cursor, endianness);
            cursor += TYPE_LENGTH;

            if (debug) {
                console.info('Unpacking', type, TypeNames[type]);
            }

            // Retrieve "length"
            if (type === Types.ARRAY || type === Types.OBJECT) {
                length = view.getUint16(cursor, endianness);
                cursor += LENGTH_LENGTH;

                if (debug) {
                    console.info('Content Length', length);
                }
            }

            // Retrieve "byte_length"
            byte_length = view.getUint32(cursor, endianness);
            cursor += BYTES_LENGTH;

            if (debug) {
                console.info('Byte Length', byte_length, 'bytes');
            }

            var type_name = Length[type];
            var unit = type_name === null ? 0 : root[type_name + 'Array'].BYTES_PER_ELEMENT;

            switch (type) {
                case Types.NULL:
                case Types.UNDEFINED:
                    if (debug) {
                        binary_dump(view, start, cursor - start);
                    }
                    // NULL and UNDEFINED doesn't have any octet
                    value = null;
                    break;

                case Types.STRING:
                    length = byte_length / unit;
                    var string = [];
                    for (i = 0; i < length; i++) {
                        var code = view.getUint16(cursor, endianness);
                        cursor += unit;
                        string.push(String.fromCharCode(code));
                    }
                    value = string.join('');
                    if (debug) {
                        console.info('Actual Content %c"' + value + '"', 'font-weight:bold;');
                        binary_dump(view, start, cursor - start);
                    }
                    break;

                case Types.NUMBER:
                    value = view.getFloat64(cursor, endianness);
                    cursor += unit;
                    if (debug) {
                        console.info('Actual Content %c"' + value.toString() + '"', 'font-weight:bold;');
                        binary_dump(view, start, cursor - start);
                    }
                    break;

                case Types.BOOLEAN:
                    value = view.getUint8(cursor, endianness) === 1 ? true : false;
                    cursor += unit;
                    if (debug) {
                        console.info('Actual Content %c"' + value.toString() + '"', 'font-weight:bold;');
                        binary_dump(view, start, cursor - start);
                    }
                    break;

                case Types.INT8ARRAY:
                case Types.INT16ARRAY:
                case Types.INT32ARRAY:
                case Types.UINT8ARRAY:
                case Types.UINT16ARRAY:
                case Types.UINT32ARRAY:
                case Types.FLOAT32ARRAY:
                case Types.FLOAT64ARRAY:
                case Types.ARRAYBUFFER:
                    elem = view.buffer.slice(cursor, cursor + byte_length);
                    cursor += byte_length;

                    // If ArrayBuffer
                    if (type === Types.ARRAYBUFFER) {
                        value = elem;

                        // If other TypedArray
                    } else {
                        value = new root[type_name + 'Array'](elem);
                    }

                    if (debug) {
                        binary_dump(view, start, cursor - start);
                    }
                    break;

                case Types.BLOB:
                    if (debug) {
                        binary_dump(view, start, cursor - start);
                    }
                    // If Blob is available (on browser)
                    if (root.Blob) {
                        var mime = unpack(view, cursor);
                        var buffer = unpack(view, mime.cursor);
                        cursor = buffer.cursor;
                        value = new Blob([buffer.value], {
                            type: mime.value
                        });
                    } else {
                        // node.js implementation goes here
                        elem = view.buffer.slice(cursor, cursor + byte_length);
                        cursor += byte_length;
                        // node.js implementatino uses Buffer to help Blob
                        value = new Buffer(elem);
                    }
                    break;

                case Types.ARRAY:
                    if (debug) {
                        binary_dump(view, start, cursor - start);
                    }
                    value = [];
                    for (i = 0; i < length; i++) {
                        // Retrieve array element
                        elem = unpack(view, cursor);
                        cursor = elem.cursor;
                        value.push(elem.value);
                    }
                    break;

                case Types.OBJECT:
                    if (debug) {
                        binary_dump(view, start, cursor - start);
                    }
                    value = {};
                    for (i = 0; i < length; i++) {
                        // Retrieve object key and value in sequence
                        var key = unpack(view, cursor);
                        var val = unpack(view, key.cursor);
                        cursor = val.cursor;
                        value[key.value] = val.value;
                    }
                    break;

                default:
                    throw 'TypeError: Type not supported.';
            }
            return {
                value: value,
                cursor: cursor
            };
        };

        /**
         * deferred function to process multiple serialization in order
         * @param  {array}   array    [description]
         * @param  {Function} callback [description]
         * @return {void} no return value
         */
        var deferredSerialize = function(array, callback) {
            var length = array.length,
                results = [],
                count = 0,
                byte_length = 0;
            for (var i = 0; i < array.length; i++) {
                (function(index) {
                    serialize(array[index], function(result) {
                        // store results in order
                        results[index] = result;
                        // count byte length
                        byte_length += result[0].header_size + result[0].byte_length;
                        // when all results are on table
                        if (++count === length) {
                            // finally concatenate all reuslts into a single array in order
                            var array = [];
                            for (var j = 0; j < results.length; j++) {
                                array = array.concat(results[j]);
                            }
                            callback(array, byte_length);
                        }
                    });
                })(i);
            }
        };

        /**
         * Serializes object and return byte_length
         * @param  {mixed} obj JavaScript object you want to serialize
         * @return {Array} Serialized array object
         */
        var serialize = function(obj, callback) {
            var subarray = [],
                unit = 1,
                header_size = TYPE_LENGTH + BYTES_LENGTH,
                type, byte_length = 0,
                length = 0,
                value = obj;

            type = find_type(obj);

            unit = Length[type] === undefined || Length[type] === null ? 0 :
                root[Length[type] + 'Array'].BYTES_PER_ELEMENT;

            switch (type) {
                case Types.UNDEFINED:
                case Types.NULL:
                    break;

                case Types.NUMBER:
                case Types.BOOLEAN:
                    byte_length = unit;
                    break;

                case Types.STRING:
                    length = obj.length;
                    byte_length += length * unit;
                    break;

                case Types.INT8ARRAY:
                case Types.INT16ARRAY:
                case Types.INT32ARRAY:
                case Types.UINT8ARRAY:
                case Types.UINT16ARRAY:
                case Types.UINT32ARRAY:
                case Types.FLOAT32ARRAY:
                case Types.FLOAT64ARRAY:
                    length = obj.length;
                    byte_length += length * unit;
                    break;

                case Types.ARRAY:
                    deferredSerialize(obj, function(subarray, byte_length) {
                        callback([{
                            type: type,
                            length: obj.length,
                            header_size: header_size + LENGTH_LENGTH,
                            byte_length: byte_length,
                            value: null
                        }].concat(subarray));
                    });
                    return;

                case Types.OBJECT:
                    var deferred = [];
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            deferred.push(key);
                            deferred.push(obj[key]);
                            length++;
                        }
                    }
                    deferredSerialize(deferred, function(subarray, byte_length) {
                        callback([{
                            type: type,
                            length: length,
                            header_size: header_size + LENGTH_LENGTH,
                            byte_length: byte_length,
                            value: null
                        }].concat(subarray));
                    });
                    return;

                case Types.ARRAYBUFFER:
                    byte_length += obj.byteLength;
                    break;

                case Types.BLOB:
                    var mime_type = obj.type;
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        deferredSerialize([mime_type, e.target.result], function(subarray, byte_length) {
                            callback([{
                                type: type,
                                length: length,
                                header_size: header_size,
                                byte_length: byte_length,
                                value: null
                            }].concat(subarray));
                        });
                    };
                    reader.onerror = function(e) {
                        throw 'FileReader Error: ' + e;
                    };
                    reader.readAsArrayBuffer(obj);
                    return;

                case Types.BUFFER:
                    byte_length += obj.length;
                    break;

                default:
                    throw 'TypeError: Type "' + obj.constructor.name + '" not supported.';
            }

            callback([{
                type: type,
                length: length,
                header_size: header_size,
                byte_length: byte_length,
                value: value
            }].concat(subarray));
        };

        /**
         * Deserialize binary and return JavaScript object
         * @param  ArrayBuffer buffer ArrayBuffer you want to deserialize
         * @return mixed              Retrieved JavaScript object
         */
        var deserialize = function(buffer, callback) {
            var view = buffer instanceof DataView ? buffer : new DataView(buffer);
            var result = unpack(view, 0);
            return result.value;
        };

        if (debug) {
            root.Test = {
                BIG_ENDIAN: BIG_ENDIAN,
                LITTLE_ENDIAN: LITTLE_ENDIAN,
                Types: Types,
                pack: pack,
                unpack: unpack,
                serialize: serialize,
                deserialize: deserialize
            };
        }

        var binarize = {
            pack: function(obj, callback) {
                try {
                    if (debug) console.info('%cPacking Start', 'font-weight: bold; color: red;', obj);
                    serialize(obj, function(array) {
                        if (debug) console.info('Serialized Object', array);
                        callback(pack(array));
                    });
                } catch (e) {
                    throw e;
                }
            },
            unpack: function(buffer, callback) {
                try {
                    if (debug) console.info('%cUnpacking Start', 'font-weight: bold; color: red;', buffer);
                    var result = deserialize(buffer);
                    if (debug) console.info('Deserialized Object', result);
                    callback(result);
                } catch (e) {
                    throw e;
                }
            }
        };

        if (typeof module !== 'undefined' && module.exports) {
            module.exports = binarize;
        } else {
            root.binarize = binarize;
        }
    })(typeof global !== 'undefined' ? global : this);
})();
