// 2013, Muaz Khan - https://github.com/muaz-khan
// MIT License     - https://www.webrtc-experiment.com/licence/
// Experiments     - https://github.com/muaz-khan/WebRTC-Experiment
// Repository      - https://github.com/muaz-khan/SdpSerializer
// -----------------------------------
// The purpose of this library is to explain possible customization
// of session description (sdp).
// 
// It will be updated for each new hack!
// -----------------------------------
// Serializes the passed in SessionDescription string.

/* How to use?
var serializer = new SdpSerializer(sdp);

// remove entire audio m-line
serializer.audio.remove();

// change order of a payload type in video m-line
serializer.video.payload(117).order(0);

// inject new-line after a specific payload type; under video m-line
serializer.video.payload(117).newLine('a=ptime:10');

// remove a specific payload type; under video m-line
serializer.video.payload(100).remove();
   
// want to add/replace a crypto line?
serializer.video.crypto().newLine('a=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:AAAAAAAAAAAAAAAAAAAAAAAAA');
   
// want to remove a crypto line?
serializer.video.crypto(80).remove();
   
// want to set direction?
serializer.video.direction.set('sendonly');
   
// want to get direction?
serializer.video.direction.get();
   
// want to remove entire audio or video track?
// usually, in video m-line:
// 0-track is always "video" stream
// 1-track will be screen sharing stream (if attached)
serializer.video.track(0).remove()
   
// get serialized sdp
sdp = serializer.deserialize();
*/

function SdpSerializer(sdp) {
    var mLines = { };
    var topLines = [];

    var isAudioMLine = false,
        isVideoMLine = false,
        isDataMLine = false;

    var isMidLine = false;

    var splitted = sdp.split('\r\n');
    for (var i = 0; i < splitted.length; i++) {
        var line = splitted[i];

        if (isAudioMLine || line.indexOf('m=audio') == 0) {
            isAudioMLine = true;

            _serialize('audio');

            // if next line is video m-line
            line = splitted[i + 1];
            if (line && line.indexOf('m=video') == 0) {
                isMidLine = isAudioMLine = false;
            }
        } else if (isVideoMLine || line.indexOf('m=video') == 0) {
            isVideoMLine = true;

            _serialize('video');

            // if next line is data m-line
            line = splitted[i + 1];
            if (line && line.indexOf('m=data') == 0) {
                isMidLine = isVideoMLine = false;
            }
        } else if (isDataMLine || line.indexOf('m=data') == 0) {
            isDataMLine = true;

            _serialize('data');
        } else {
            topLines[topLines.length] = line;
        }
    }

    // serialize sdp for each m-line

    function _serialize(mLine) {
        if (!mLines[mLine]) {
            mLines[mLine] = {
                line: line,
                attributes: [],
                payload: { },
                ssrc: [],
                crypto: { }
            };

            // get all available payload types in current m-line
            var payloads = line.split('RTP/SAVPF ')[1].split(' ');
            for (var p = 0; p < payloads.length; p++) {
                mLines[mLine].payload[payloads[p]] = '';
            }
        } else {
            if (line == 'a=mid:' + mLine) {
                var prevLine = splitted[i - 1];
                if (prevLine) {
                    mLines[mLine].direction = prevLine.split('a=')[1];

                    // remove "direction" attribute
                    delete mLines[mLine].attributes[mLines[mLine].attributes.length - 1];
                    mLines[mLine].attributes = swap(mLines[mLine].attributes);
                }

                isMidLine = true;
                mLines[mLine]['a=mid:' + mLine] = {
                    line: line,
                    attributes: []
                };
            } else if (isMidLine) {
                if (line.indexOf('a=crypto:') == 0) {
                    mLines[mLine].crypto[line.split('AES_CM_128_HMAC_SHA1_')[1].split(' ')[0]] = line;
                } else if (line.indexOf('a=rtpmap:') == 0) {
                    var _splitted = line.split('a=rtpmap:')[1].split(' ');
                    mLines[mLine].payload[_splitted[0]] = _splitted[1];

                    // a single payload can contain multiple attributes
                    (function selfInvoker() {
                        line = splitted[i + 1];
                        if (line && line.indexOf('a=rtpmap:') == -1 && line.indexOf('m=') == -1) {
                            if (line.indexOf('a=ssrc') == -1) {
                                mLines[mLine].payload[_splitted[0]] += '\r\n' + line;
                            }

                            // media-lines
                            if (line.indexOf('a=ssrc') != -1) {
                                mLines[mLine].ssrc[mLines[mLine].ssrc.length] = line;
                            }

                            i++;
                            selfInvoker();
                        }
                    })();
                } else {
                    mLines[mLine]['a=mid:' + mLine].attributes[mLines[mLine]['a=mid:' + mLine].attributes.length] = line;
                }
            } else {
                mLines[mLine].attributes[mLines[mLine].attributes.length] = line;
            }
        }
    }

    // formatting ssrc
    (function() {
        _formatSSRC('audio');
        _formatSSRC('video');
        _formatSSRC('data');
    })();

    function _formatSSRC(mLine) {
        if (!mLines[mLine]) return;

        // reformatting ssrc
        var formattedSSRC = [];
        for (var s = 0; s < mLines[mLine].ssrc.length; s++) {
            var ssrcLine = mLines[mLine].ssrc[s];

            if (ssrcLine.indexOf('cname:') != -1) {
                formattedSSRC[formattedSSRC.length] = [];
            }
            formattedSSRC[formattedSSRC.length - 1][formattedSSRC[formattedSSRC.length - 1].length] = ssrcLine;
        }
        mLines[mLine].ssrc = formattedSSRC;
    }

    // remove entire m-line

    function removeMLine(mLine) {
        if (mLines[mLine]) delete mLines[mLine];

        // a=group:BUNDLE audio video
        for (var i = 0; i < topLines.length; i++) {
            if (topLines[i].indexOf('a=group') != -1) {
                var splitted = topLines[i].split('a=group:BUNDLE ')[1].split(' ');
                topLines[i] = 'a=group:BUNDLE';
                for (var j = 0; j < splitted.length; j++) {
                    if (splitted[j] != mLine) topLines[i] += ' ' + splitted[j];
                }
            }
        }
    }

    // remove a specific payload type

    function removePayload(payload, mLine) {
        // if invalid payload type
        if (!mLines[mLine] || mLines[mLine].line.indexOf(payload) == -1) return;

        if (mLines[mLine].payload[payload]) delete mLines[mLine].payload[payload];

        var payloads = mLines[mLine].line.split('RTP/SAVPF ')[1].split(' ');

        for (var i = 0; i < payloads.length; i++) {
            if (payloads[i] == payload) delete payloads[i];
        }
        payloads = swap(payloads);
        mLines[mLine].line = mLines[mLine].line.split('RTP/SAVPF ')[0] + 'RTP/SAVPF ' + payloads.join(' ');
    }

    // change payload type's order	

    function order(payload, position, mLine) {
        // if invalid payload type
        if (!mLines[mLine] || mLines[mLine].line.indexOf(payload) == -1) return;

        var payloads = mLines[mLine].line.split('RTP/SAVPF ')[1].split(' ');
        var arr = [];
        for (var i = 0; i < payloads.length; i++) {
            if (payloads[i] == payload) {
                arr[position] = payloads[i];

                delete payloads[i];
                payloads = swap(payloads);
            }
        }

        for (var i = 0; i < payloads.length; i++) {
            if (i < position) arr[i] = payloads[i];
            if (i >= position) arr[i + 1] = payloads[i];
        }

        // to remove NULL entries
        arr = swap(arr);

        mLines[mLine].line = mLines[mLine].line.split('RTP/SAVPF ')[0] + 'RTP/SAVPF ' + arr.join(' ');
    }

    function swap(arr) {
        var swapped = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i]) swapped[swapped.length] = arr[i];
        }
        return swapped;
    }

    // deserializing the sdp
    this.deserialize = function() {
        var sdp = '';

        for (var i = 0; i < topLines.length; i++) {
            sdp += topLines[i] + '\r\n';
        }

        sdp = _deserialize(sdp, 'audio');
        sdp = _deserialize(sdp, 'video');
        sdp = _deserialize(sdp, 'data');

        return sdp;
    };

    function _deserialize(sdp, mLine) {
        if (!mLines[mLine]) return sdp;

        sdp += mLines[mLine].line + '\r\n';

        for (var i = 0; i < mLines[mLine].attributes.length; i++) {
            sdp += mLines[mLine].attributes[i] + '\r\n';
        }

        if (mLines[mLine].direction) sdp += 'a=' + mLines[mLine].direction + '\r\n';

        sdp += 'a=mid:' + mLine + '\r\n';

        for (var i = 0; i < mLines[mLine]['a=mid:' + mLine].attributes.length; i++) {
            if (mLines[mLine]['a=mid:' + mLine].attributes[i])
                sdp += mLines[mLine]['a=mid:' + mLine].attributes[i] + '\r\n';
        }

        // crypto lines
        for (var crypto in mLines[mLine].crypto) {
            sdp += mLines[mLine].crypto[crypto] + '\r\n';
        }

        // order payload types accordingly
        var payloads = mLines[mLine].line.split('RTP/SAVPF ')[1].split(' ');
        for (var p = 0; p < payloads.length; p++) {
            var payload = payloads[p];
            if (payload)
                sdp += 'a=rtpmap:' + payload + ' ' + mLines[mLine].payload[payload] + '\r\n';
        }

        // media lines
        for (var s = 0; s < mLines[mLine].ssrc.length; s++) {
            var ssrc = mLines[mLine].ssrc[s];
            for (var m = 0; m < ssrc.length; m++) {
                sdp += ssrc[m] + '\r\n';
            }
        }

        return sdp;
    }

    function getPublicMLine(mLine) {
        return {
            mLine: mLine,
            payload: function(payload) {
                if (!mLines[this.mLine] || !mLines[this.mLine].payload[payload]) console.error(payload, 'doesn\'nt exits.');

                return {
                    payload: payload,
                    mLine: this.mLine,
                    newLine: function(line) {
                        mLines[this.mLine].payload[this.payload] += '\r\n' + line;
                    },
                    remove: function() {
                        removePayload(this.payload, this.mLine);
                    },
                    order: function(position) {
                        order(this.payload, position, this.mLine);
                    }
                };
            },
            remove: function() {
                removeMLine(this.mLine);
            },
            isRejected: function() {
                // To track whether audio and/or video track is rejected;
                // By default: m=audio 1234
                // If rejected: m=audio 0

                // By default: m=video 1234
                // If rejected: m=video 0
                var secondPart = mLines[this.mLine].line.split('m=' + this.mLine)[1];
                return parseInt(secondPart) == 0;
            },
            crypto: function(number) {
                var crypto = mLines[this.mLine].crypto[number];
                return {
                    mLine: this.mLine,
                    remove: function() {
                        if (!crypto) return;
                        delete mLines[this.mLine].crypto[number];
                    },
                    newLine: function(line) {
                        mLines[this.mLine].crypto[line.split('AES_CM_128_HMAC_SHA1_')[1].split(' ')[0]] = line;
                    }
                };
            },
            direction: {
                mLine: this.mLine,
                set: function(direction) {
                    mLines[this.mLine].direction = direction;
                },
                get: function() {
                    return mLines[this.mLine].direction;
                }
            },
            track: function(index) {
                var ssrc = mLines[mLine].ssrc[index];
                return {
                    mLine: this.mLine,
                    remove: function() {
                        if (!ssrc) return;
                        delete mLines[mLine].ssrc[index];

                        mLines[mLine].ssrc = swap(mLines[mLine].ssrc);
                    }
                };
            }
        };
    }

    this.audio = getPublicMLine('audio');
    this.video = getPublicMLine('video');
    this.data = getPublicMLine('data');

    this._inner = mLines;

    // formatted output
    console.debug('Serialized SDP', this._inner);
}

// kApplicationSpecificMaximum="AS"=50/256/1638400
// SdpSerializer.SerializeASBandwidth(sdp, {audio,video,data});
SdpSerializer.SerializeASBandwidth = function(sdp, bandwidth) {
    bandwidth = bandwidth || { };

    // remove existing bandwidth lines
    sdp = sdp.replace( /b=AS([^\r\n]+\r\n)/g , '');

    sdp = sdp.replace( /a=mid:audio\r\n/g , 'a=mid:audio\r\nb=AS:' + (bandwidth.audio || 50) + '\r\n');
    sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\nb=AS:' + (bandwidth.video || 256) + '\r\n');
    sdp = sdp.replace( /a=mid:data\r\n/g , 'a=mid:data\r\nb=AS:' + (bandwidth.data || 1638400) + '\r\n');

    return sdp;
};

// SdpSerializer.SerializePTime(sdp, {minptime,maxptime});
// You can say it "framerate" for audio RTP ports
SdpSerializer.SerializePTime = function(sdp, ptimes) {
    ptimes = ptimes || { };

    sdp = sdp.replace('a=fmtp:111 minptime=10', 'a=fmtp:111 minptime=' + (ptimes.minptime || 10));
    sdp = sdp.replace('a=maxptime:60', 'a=maxptime:' + (ptimes.maxptime || 60));

    return sdp;
};

SdpSerializer.SerializeGoogleMinBitrate = function(sdp, bitrate) {
    sdp = sdp.replace( /a=mid:video\r\n/g ,
        'a=mid:video\r\na=rtpmap:120 VP8/90000\r\na=fmtp:120 \
							x-google-min-bitrate=' + (bitrate || 10) + '\r\n');
    return sdp;
};

// to skip UDP ports
SdpSerializer.RTPOverTCP = function(sdp) {
    return sdp.replace( /a=candidate:.*udp.*\r\n/g , '');
};

// a=rtpmap:111 opus/48000/2
// serializer.audio.payload(111).newLine('a=rtcp-fb:111 nack');

// m=video 3457 RTP/SAVPF 101
// serializer.video.payload(101).newLine('a=rtpmap:101 VP8/90000');
// serializer.video.payload(101).newLine('a=rtcp-fb:101 nack');
// serializer.video.payload(101).newLine('a=rtcp-fb:101 goog-remb');
// serializer.video.payload(101).newLine('a=rtcp-fb:101 ccm fir');
// VP8 freezing issue on Chrome 28
// https://code.google.com/p/webrtc/issues/detail?id=1897

// a=crypto:1 AES_CM_128_HMAC_SHA1_32 --------- kAttributeCryptoVoice
// a=crypto:1 AES_CM_128_HMAC_SHA1_80 --------- kAttributeCryptoVideo


// a=mid:video
// a=rtpmap:120 VP8/90000
// a=fmtp:120 x-google-min-bitrate=10
