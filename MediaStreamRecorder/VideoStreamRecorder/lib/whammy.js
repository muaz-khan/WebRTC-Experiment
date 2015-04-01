// Muaz Khan     - https://github.com/muaz-khan 
// neizerth      - https://github.com/neizerth
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/streamproc/MediaStreamRecorder

// Note:
// ==========================================================
// whammy.js is an "external library" 
// and has its own copyrights. Taken from "Whammy" project.


// https://github.com/antimatter15/whammy/blob/master/LICENSE
// =========
// Whammy.js

// todo: Firefox now supports webp for webm containers!
// their MediaRecorder implementation works well!
// should we provide an option to record via Whammy.js or MediaRecorder API is a better solution?

var Whammy = (function() {

    function toWebM(frames) {
        var info = checkFrames(frames);

        var CLUSTER_MAX_DURATION = 30000;

        var EBML = [{
            "id": 0x1a45dfa3, // EBML
            "data": [{
                "data": 1,
                "id": 0x4286 // EBMLVersion
            }, {
                "data": 1,
                "id": 0x42f7 // EBMLReadVersion
            }, {
                "data": 4,
                "id": 0x42f2 // EBMLMaxIDLength
            }, {
                "data": 8,
                "id": 0x42f3 // EBMLMaxSizeLength
            }, {
                "data": "webm",
                "id": 0x4282 // DocType
            }, {
                "data": 2,
                "id": 0x4287 // DocTypeVersion
            }, {
                "data": 2,
                "id": 0x4285 // DocTypeReadVersion
            }]
        }, {
            "id": 0x18538067, // Segment
            "data": [{
                "id": 0x1549a966, // Info
                "data": [{
                    "data": 1e6, //do things in millisecs (num of nanosecs for duration scale)
                    "id": 0x2ad7b1 // TimecodeScale
                }, {
                    "data": "whammy",
                    "id": 0x4d80 // MuxingApp
                }, {
                    "data": "whammy",
                    "id": 0x5741 // WritingApp
                }, {
                    "data": doubleToString(info.duration),
                    "id": 0x4489 // Duration
                }]
            }, {
                "id": 0x1654ae6b, // Tracks
                "data": [{
                    "id": 0xae, // TrackEntry
                    "data": [{
                        "data": 1,
                        "id": 0xd7 // TrackNumber
                    }, {
                        "data": 1,
                        "id": 0x63c5 // TrackUID
                    }, {
                        "data": 0,
                        "id": 0x9c // FlagLacing
                    }, {
                        "data": "und",
                        "id": 0x22b59c // Language
                    }, {
                        "data": "V_VP8",
                        "id": 0x86 // CodecID
                    }, {
                        "data": "VP8",
                        "id": 0x258688 // CodecName
                    }, {
                        "data": 1,
                        "id": 0x83 // TrackType
                    }, {
                        "id": 0xe0, // Video
                        "data": [{
                            "data": info.width,
                            "id": 0xb0 // PixelWidth
                        }, {
                            "data": info.height,
                            "id": 0xba // PixelHeight
                        }]
                    }]
                }]
            }]
        }];

        //Generate clusters (max duration)
        var frameNumber = 0;
        var clusterTimecode = 0;
        while (frameNumber < frames.length) {

            var clusterFrames = [];
            var clusterDuration = 0;
            do {
                clusterFrames.push(frames[frameNumber]);
                clusterDuration += frames[frameNumber].duration;
                frameNumber++;
            } while (frameNumber < frames.length && clusterDuration < CLUSTER_MAX_DURATION);

            var clusterCounter = 0;
            var cluster = {
                "id": 0x1f43b675, // Cluster
                "data": [{
                    "data": clusterTimecode,
                    "id": 0xe7 // Timecode
                }].concat(clusterFrames.map(function(webp) {
                    var block = makeSimpleBlock({
                        discardable: 0,
                        frame: webp.data.slice(4),
                        invisible: 0,
                        keyframe: 1,
                        lacing: 0,
                        trackNum: 1,
                        timecode: Math.round(clusterCounter)
                    });
                    clusterCounter += webp.duration;
                    return {
                        data: block,
                        id: 0xa3
                    };
                }))
            }; //Add cluster to segment
            EBML[1].data.push(cluster);
            clusterTimecode += clusterDuration;
        }

        return generateEBML(EBML);
    }

    // sums the lengths of all the frames and gets the duration

    function checkFrames(frames) {
        if (!frames[0]) {
            console.warn('Something went wrong. Maybe WebP format is not supported in the current browser.');
            return;
        }

        var width = frames[0].width,
            height = frames[0].height,
            duration = frames[0].duration;

        for (var i = 1; i < frames.length; i++) {
            duration += frames[i].duration;
        }
        return {
            duration: duration,
            width: width,
            height: height
        };
    }

    function numToBuffer(num) {
        var parts = [];
        while (num > 0) {
            parts.push(num & 0xff);
            num = num >> 8;
        }
        return new Uint8Array(parts.reverse());
    }

    function strToBuffer(str) {
        return new Uint8Array(str.split('').map(function(e) {
            return e.charCodeAt(0);
        }));
    }

    function bitsToBuffer(bits) {
        var data = [];
        var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
        bits = pad + bits;
        for (var i = 0; i < bits.length; i += 8) {
            data.push(parseInt(bits.substr(i, 8), 2));
        }
        return new Uint8Array(data);
    }

    function generateEBML(json) {
        var ebml = [];
        for (var i = 0; i < json.length; i++) {
            var data = json[i].data;
            if (typeof data == 'object') data = generateEBML(data);
            if (typeof data == 'number') data = bitsToBuffer(data.toString(2));
            if (typeof data == 'string') data = strToBuffer(data);

            var len = data.size || data.byteLength || data.length;
            var zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8);
            var size_str = len.toString(2);
            var padded = (new Array((zeroes * 7 + 7 + 1) - size_str.length)).join('0') + size_str;
            var size = (new Array(zeroes)).join('0') + '1' + padded;

            ebml.push(numToBuffer(json[i].id));
            ebml.push(bitsToBuffer(size));
            ebml.push(data);
        }

        return new Blob(ebml, {
            type: "video/webm"
        });
    }

    function toBinStr_old(bits) {
        var data = '';
        var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
        bits = pad + bits;
        for (var i = 0; i < bits.length; i += 8) {
            data += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
        }
        return data;
    }

    function generateEBML_old(json) {
        var ebml = '';
        for (var i = 0; i < json.length; i++) {
            var data = json[i].data;
            if (typeof data == 'object') data = generateEBML_old(data);
            if (typeof data == 'number') data = toBinStr_old(data.toString(2));

            var len = data.length;
            var zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8);
            var size_str = len.toString(2);
            var padded = (new Array((zeroes * 7 + 7 + 1) - size_str.length)).join('0') + size_str;
            var size = (new Array(zeroes)).join('0') + '1' + padded;

            ebml += toBinStr_old(json[i].id.toString(2)) + toBinStr_old(size) + data;

        }
        return ebml;
    }

    function makeSimpleBlock(data) {
        var flags = 0;
        if (data.keyframe) flags |= 128;
        if (data.invisible) flags |= 8;
        if (data.lacing) flags |= (data.lacing << 1);
        if (data.discardable) flags |= 1;
        if (data.trackNum > 127) {
            throw "TrackNumber > 127 not supported";
        }
        var out = [data.trackNum | 0x80, data.timecode >> 8, data.timecode & 0xff, flags].map(function(e) {
            return String.fromCharCode(e);
        }).join('') + data.frame;

        return out;
    }

    function parseWebP(riff) {
        var VP8 = riff.RIFF[0].WEBP[0];

        var frame_start = VP8.indexOf('\x9d\x01\x2a'); // A VP8 keyframe starts with the 0x9d012a header
        for (var i = 0, c = []; i < 4; i++) c[i] = VP8.charCodeAt(frame_start + 3 + i);

        var width, height, tmp;

        //the code below is literally copied verbatim from the bitstream spec
        tmp = (c[1] << 8) | c[0];
        width = tmp & 0x3FFF;
        tmp = (c[3] << 8) | c[2];
        height = tmp & 0x3FFF;
        return {
            width: width,
            height: height,
            data: VP8,
            riff: riff
        };
    }

    function parseRIFF(string) {
        var offset = 0;
        var chunks = {};

        while (offset < string.length) {
            var id = string.substr(offset, 4);
            var len = parseInt(string.substr(offset + 4, 4).split('').map(function(i) {
                var unpadded = i.charCodeAt(0).toString(2);
                return (new Array(8 - unpadded.length + 1)).join('0') + unpadded;
            }).join(''), 2);
            var data = string.substr(offset + 4 + 4, len);
            offset += 4 + 4 + len;
            chunks[id] = chunks[id] || [];

            if (id == 'RIFF' || id == 'LIST') {
                chunks[id].push(parseRIFF(data));
            } else {
                chunks[id].push(data);
            }
        }
        return chunks;
    }

    function doubleToString(num) {
        return [].slice.call(
            new Uint8Array((new Float64Array([num])).buffer), 0).map(function(e) {
            return String.fromCharCode(e);
        }).reverse().join('');
    }

    // a more abstract-ish API

    function WhammyVideo(duration) {
        this.frames = [];
        this.duration = duration || 1;
        this.quality = 100;
    }

    WhammyVideo.prototype.add = function(frame, duration) {
        if ('canvas' in frame) { //CanvasRenderingContext2D
            frame = frame.canvas;
        }

        if ('toDataURL' in frame) {
            frame = frame.toDataURL('image/webp', this.quality);
        }

        if (!(/^data:image\/webp;base64,/ig).test(frame)) {
            throw "Input must be formatted properly as a base64 encoded DataURI of type image/webp";
        }
        this.frames.push({
            image: frame,
            duration: duration || this.duration
        });
    };
    WhammyVideo.prototype.compile = function() {
        return new toWebM(this.frames.map(function(frame) {
            var webp = parseWebP(parseRIFF(atob(frame.image.slice(23))));
            webp.duration = frame.duration;
            return webp;
        }));
    };
    return {
        Video: WhammyVideo,
        toWebM: toWebM
    };
})();
