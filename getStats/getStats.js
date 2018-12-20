'use strict';

// Last time updated: 2018-12-19 9:53:31 AM UTC

// _______________
// getStats v1.0.8

// Open-Sourced: https://github.com/muaz-khan/getStats

// --------------------------------------------------
// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// --------------------------------------------------

window.getStats = function(mediaStreamTrack, callback, interval) {

    var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

    if (typeof MediaStreamTrack === 'undefined') {
        MediaStreamTrack = {}; // todo?
    }

    var systemNetworkType = ((navigator.connection || {}).type || 'unknown').toString().toLowerCase();

    var getStatsResult = {
        encryption: 'sha-256',
        audio: {
            send: {
                tracks: [],
                codecs: [],
                availableBandwidth: 0,
                streams: 0,
                framerateMean: 0,
                bitrateMean: 0
            },
            recv: {
                tracks: [],
                codecs: [],
                availableBandwidth: 0,
                streams: 0,
                framerateMean: 0,
                bitrateMean: 0
            },
            bytesSent: 0,
            bytesReceived: 0
        },
        video: {
            send: {
                tracks: [],
                codecs: [],
                availableBandwidth: 0,
                streams: 0,
                framerateMean: 0,
                bitrateMean: 0
            },
            recv: {
                tracks: [],
                codecs: [],
                availableBandwidth: 0,
                streams: 0,
                framerateMean: 0,
                bitrateMean: 0
            },
            bytesSent: 0,
            bytesReceived: 0
        },
        bandwidth: {
            systemBandwidth: 0,
            sentPerSecond: 0,
            encodedPerSecond: 0,
            helper: {
                audioBytesSent: 0,
                videoBytestSent: 0
            },
            speed: 0
        },
        results: {},
        connectionType: {
            systemNetworkType: systemNetworkType,
            systemIpAddress: '192.168.1.2',
            local: {
                candidateType: [],
                transport: [],
                ipAddress: [],
                networkType: []
            },
            remote: {
                candidateType: [],
                transport: [],
                ipAddress: [],
                networkType: []
            }
        },
        resolutions: {
            send: {
                width: 0,
                height: 0
            },
            recv: {
                width: 0,
                height: 0
            }
        },
        internal: {
            audio: {
                send: {},
                recv: {}
            },
            video: {
                send: {},
                recv: {}
            },
            candidates: {}
        },
        nomore: function() {
            nomore = true;
        }
    };

    var getStatsParser = {
        checkIfOfferer: function(result) {
            if (result.type === 'googLibjingleSession') {
                getStatsResult.isOfferer = result.googInitiator;
            }
        }
    };

    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    var peer = this;

    if (!(arguments[0] instanceof RTCPeerConnection)) {
        throw '1st argument is not instance of RTCPeerConnection.';
    }

    peer = arguments[0];

    if (arguments[1] instanceof MediaStreamTrack) {
        mediaStreamTrack = arguments[1]; // redundant on non-safari
        callback = arguments[2];
        interval = arguments[3];
    }

    var nomore = false;

    function getStatsLooper() {
        getStatsWrapper(function(results) {
            if (!results || !results.forEach) return;

            results.forEach(function(result) {
                Object.keys(getStatsParser).forEach(function(key) {
                    if (typeof getStatsParser[key] === 'function') {
                        try {
                            getStatsParser[key](result);
                        } catch (e) {
                            console.error(e.message, e.stack);
                        }
                    }
                });

                if (result.type !== 'local-candidate' && result.type !== 'remote-candidate' && result.type !== 'candidate-pair') {
                    // console.error('result', result);
                }
            });

            try {
                // failed|closed
                if (peer.iceConnectionState.search(/failed/gi) !== -1) {
                    nomore = true;
                }
            } catch (e) {
                nomore = true;
            }

            if (nomore === true) {
                if (getStatsResult.datachannel) {
                    getStatsResult.datachannel.state = 'close';
                }
                getStatsResult.ended = true;
            }

            // allow users to access native results
            getStatsResult.results = results;

            if (getStatsResult.audio && getStatsResult.video) {
                getStatsResult.bandwidth.speed = (getStatsResult.audio.bytesSent - getStatsResult.bandwidth.helper.audioBytesSent) + (getStatsResult.video.bytesSent - getStatsResult.bandwidth.helper.videoBytesSent);
                getStatsResult.bandwidth.helper.audioBytesSent = getStatsResult.audio.bytesSent;
                getStatsResult.bandwidth.helper.videoBytesSent = getStatsResult.video.bytesSent;
            }

            callback(getStatsResult);

            // second argument checks to see, if target-user is still connected.
            if (!nomore) {
                typeof interval != undefined && interval && setTimeout(getStatsLooper, interval || 1000);
            }
        });
    }

    // a wrapper around getStats which hides the differences (where possible)
    // following code-snippet is taken from somewhere on the github
    function getStatsWrapper(cb) {
        // if !peer or peer.signalingState == 'closed' then return;

        if (typeof window.InstallTrigger !== 'undefined' || isSafari) { // maybe "isEdge?"
            peer.getStats(window.mediaStreamTrack || null).then(function(res) {
                var items = [];
                res.forEach(function(r) {
                    items.push(r);
                });
                cb(items);
            }).catch(cb);
        } else {
            peer.getStats(function(res) {
                var items = [];
                res.result().forEach(function(res) {
                    var item = {};
                    res.names().forEach(function(name) {
                        item[name] = res.stat(name);
                    });
                    item.id = res.id;
                    item.type = res.type;
                    item.timestamp = res.timestamp;
                    items.push(item);
                });
                cb(items);
            });
        }
    };

    getStatsParser.datachannel = function(result) {
        if (result.type !== 'datachannel') return;

        getStatsResult.datachannel = {
            state: result.state // open or connecting
        }
    };

    getStatsParser.googCertificate = function(result) {
        if (result.type == 'googCertificate') {
            getStatsResult.encryption = result.googFingerprintAlgorithm;
        }

        // Safari-11 or higher
        if (result.type == 'certificate') {
            // todo: is it possible to have different encryption methods for senders and receivers?
            // if yes, then we need to set:
            //    getStatsResult.encryption.local = value;
            //    getStatsResult.encryption.remote = value;
            getStatsResult.encryption = result.fingerprintAlgorithm;
        }
    };

    getStatsParser.checkAudioTracks = function(result) {
        if (result.mediaType !== 'audio') return;

        var sendrecvType = result.id.split('_').pop();
        if (result.isRemote === true) {
            sendrecvType = 'recv';
        }
        if (result.isRemote === false) {
            sendrecvType = 'send';
        }

        if (!sendrecvType) return;

        if (getStatsResult.audio[sendrecvType].codecs.indexOf(result.googCodecName || 'opus') === -1) {
            getStatsResult.audio[sendrecvType].codecs.push(result.googCodecName || 'opus');
        }

        if (!!result.bytesSent) {
            var kilobytes = 0;
            if (!getStatsResult.internal.audio[sendrecvType].prevBytesSent) {
                getStatsResult.internal.audio[sendrecvType].prevBytesSent = result.bytesSent;
            }

            var bytes = result.bytesSent - getStatsResult.internal.audio[sendrecvType].prevBytesSent;
            getStatsResult.internal.audio[sendrecvType].prevBytesSent = result.bytesSent;

            kilobytes = bytes / 1024;
            getStatsResult.audio[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
            getStatsResult.video.bytesSent = kilobytes.toFixed(1);
        }

        if (!!result.bytesReceived) {
            var kilobytes = 0;
            if (!getStatsResult.internal.audio[sendrecvType].prevBytesReceived) {
                getStatsResult.internal.audio[sendrecvType].prevBytesReceived = result.bytesReceived;
            }

            var bytes = result.bytesReceived - getStatsResult.internal.audio[sendrecvType].prevBytesReceived;
            getStatsResult.internal.audio[sendrecvType].prevBytesReceived = result.bytesReceived;

            kilobytes = bytes / 1024;

            // getStatsResult.audio[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
            getStatsResult.video.bytesReceived = kilobytes.toFixed(1);
        }

        if (result.googTrackId && getStatsResult.audio[sendrecvType].tracks.indexOf(result.googTrackId) === -1) {
            getStatsResult.audio[sendrecvType].tracks.push(result.googTrackId);
        }
    };

    getStatsParser.checkVideoTracks = function(result) {
        if (result.mediaType !== 'video') return;

        var sendrecvType = result.id.split('_').pop();
        if (result.isRemote === true) {
            sendrecvType = 'recv';
        }
        if (result.isRemote === false) {
            sendrecvType = 'send';
        }

        if (!sendrecvType) return;

        if (getStatsResult.video[sendrecvType].codecs.indexOf(result.googCodecName || 'VP8') === -1) {
            getStatsResult.video[sendrecvType].codecs.push(result.googCodecName || 'VP8');
        }

        if (!!result.bytesSent) {
            var kilobytes = 0;
            if (!getStatsResult.internal.video[sendrecvType].prevBytesSent) {
                getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent;
            }

            var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevBytesSent;
            getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent;

            kilobytes = bytes / 1024;

            getStatsResult.video[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
            getStatsResult.video.bytesSent = kilobytes.toFixed(1);
        }

        if (!!result.bytesReceived) {
            var kilobytes = 0;
            if (!getStatsResult.internal.video[sendrecvType].prevBytesReceived) {
                getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived;
            }

            var bytes = result.bytesReceived - getStatsResult.internal.video[sendrecvType].prevBytesReceived;
            getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived;

            kilobytes = bytes / 1024;
            // getStatsResult.video[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
            getStatsResult.video.bytesReceived = kilobytes.toFixed(1);
        }

        if (result.googFrameHeightReceived && result.googFrameWidthReceived) {
            getStatsResult.resolutions[sendrecvType].width = result.googFrameWidthReceived;
            getStatsResult.resolutions[sendrecvType].height = result.googFrameHeightReceived;
        }

        if (result.googFrameHeightSent && result.googFrameWidthSent) {
            getStatsResult.resolutions[sendrecvType].width = result.googFrameWidthSent;
            getStatsResult.resolutions[sendrecvType].height = result.googFrameHeightSent;
        }

        if (result.googTrackId && getStatsResult.video[sendrecvType].tracks.indexOf(result.googTrackId) === -1) {
            getStatsResult.video[sendrecvType].tracks.push(result.googTrackId);
        }

        if (result.framerateMean) {
            getStatsResult.bandwidth.framerateMean = result.framerateMean;
            var kilobytes = 0;
            if (!getStatsResult.internal.video[sendrecvType].prevFramerateMean) {
                getStatsResult.internal.video[sendrecvType].prevFramerateMean = result.bitrateMean;
            }

            var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevFramerateMean;
            getStatsResult.internal.video[sendrecvType].prevFramerateMean = result.framerateMean;

            kilobytes = bytes / 1024;
            getStatsResult.video[sendrecvType].framerateMean = bytes.toFixed(1);
        }

        if (result.bitrateMean) {
            getStatsResult.bandwidth.bitrateMean = result.bitrateMean;
            var kilobytes = 0;
            if (!getStatsResult.internal.video[sendrecvType].prevBitrateMean) {
                getStatsResult.internal.video[sendrecvType].prevBitrateMean = result.bitrateMean;
            }

            var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevBitrateMean;
            getStatsResult.internal.video[sendrecvType].prevBitrateMean = result.bitrateMean;

            kilobytes = bytes / 1024;
            getStatsResult.video[sendrecvType].bitrateMean = bytes.toFixed(1);
        }
    };

    getStatsParser.bweforvideo = function(result) {
        if (result.type !== 'VideoBwe') return;

        getStatsResult.bandwidth.availableSendBandwidth = result.googAvailableSendBandwidth;

        getStatsResult.bandwidth.googActualEncBitrate = result.googActualEncBitrate;
        getStatsResult.bandwidth.googAvailableSendBandwidth = result.googAvailableSendBandwidth;
        getStatsResult.bandwidth.googAvailableReceiveBandwidth = result.googAvailableReceiveBandwidth;
        getStatsResult.bandwidth.googRetransmitBitrate = result.googRetransmitBitrate;
        getStatsResult.bandwidth.googTargetEncBitrate = result.googTargetEncBitrate;
        getStatsResult.bandwidth.googBucketDelay = result.googBucketDelay;
        getStatsResult.bandwidth.googTransmitBitrate = result.googTransmitBitrate;
    };

    getStatsParser.candidatePair = function(result) {
        if (result.type !== 'googCandidatePair' && result.type !== 'candidate-pair' && result.type !== 'local-candidate' && result.type !== 'remote-candidate') return;

        // result.googActiveConnection means either STUN or TURN is used.

        if (result.googActiveConnection == 'true') {
            // id === 'Conn-audio-1-0'
            // localCandidateId, remoteCandidateId

            // bytesSent, bytesReceived

            Object.keys(getStatsResult.internal.candidates).forEach(function(cid) {
                var candidate = getStatsResult.internal.candidates[cid];
                if (candidate.ipAddress.indexOf(result.googLocalAddress) !== -1) {
                    getStatsResult.connectionType.local.candidateType = candidate.candidateType;
                    getStatsResult.connectionType.local.ipAddress = candidate.ipAddress;
                    getStatsResult.connectionType.local.networkType = candidate.networkType;
                    getStatsResult.connectionType.local.transport = candidate.transport;
                }
                if (candidate.ipAddress.indexOf(result.googRemoteAddress) !== -1) {
                    getStatsResult.connectionType.remote.candidateType = candidate.candidateType;
                    getStatsResult.connectionType.remote.ipAddress = candidate.ipAddress;
                    getStatsResult.connectionType.remote.networkType = candidate.networkType;
                    getStatsResult.connectionType.remote.transport = candidate.transport;
                }
            });

            getStatsResult.connectionType.transport = result.googTransportType;

            var localCandidate = getStatsResult.internal.candidates[result.localCandidateId];
            if (localCandidate) {
                if (localCandidate.ipAddress) {
                    getStatsResult.connectionType.systemIpAddress = localCandidate.ipAddress;
                }
            }

            var remoteCandidate = getStatsResult.internal.candidates[result.remoteCandidateId];
            if (remoteCandidate) {
                if (remoteCandidate.ipAddress) {
                    getStatsResult.connectionType.systemIpAddress = remoteCandidate.ipAddress;
                }
            }
        }

        if (result.type === 'candidate-pair') {
            if (result.selected === true && result.nominated === true && result.state === 'succeeded') {
                // remoteCandidateId, localCandidateId, componentId
                var localCandidate = getStatsResult.internal.candidates[result.remoteCandidateId];
                var remoteCandidate = getStatsResult.internal.candidates[result.remoteCandidateId];

                // Firefox used above two pairs for connection
            }
        }

        if (result.type === 'local-candidate') {
            getStatsResult.connectionType.local.candidateType = result.candidateType;
            getStatsResult.connectionType.local.ipAddress = result.ipAddress;
            getStatsResult.connectionType.local.networkType = result.networkType;
            getStatsResult.connectionType.local.transport = result.mozLocalTransport || result.transport;
        }

        if (result.type === 'remote-candidate') {
            getStatsResult.connectionType.remote.candidateType = result.candidateType;
            getStatsResult.connectionType.remote.ipAddress = result.ipAddress;
            getStatsResult.connectionType.remote.networkType = result.networkType;
            getStatsResult.connectionType.remote.transport = result.mozRemoteTransport || result.transport;
        }

        if (isSafari) {
            // result.remoteCandidateId
            // todo: below line will always force "send" on Safari; find a solution
            var sendrecvType = result.localCandidateId ? 'send' : 'recv';

            if (!sendrecvType) return;

            if (!!result.bytesSent) {
                var kilobytes = 0;
                if (!getStatsResult.internal.video[sendrecvType].prevBytesSent) {
                    getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent;
                }

                var bytes = result.bytesSent - getStatsResult.internal.video[sendrecvType].prevBytesSent;
                getStatsResult.internal.video[sendrecvType].prevBytesSent = result.bytesSent;

                kilobytes = bytes / 1024;

                getStatsResult.video[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
                getStatsResult.video.bytesSent = kilobytes.toFixed(1);
            }

            if (!!result.bytesReceived) {
                var kilobytes = 0;
                if (!getStatsResult.internal.video[sendrecvType].prevBytesReceived) {
                    getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived;
                }

                var bytes = result.bytesReceived - getStatsResult.internal.video[sendrecvType].prevBytesReceived;
                getStatsResult.internal.video[sendrecvType].prevBytesReceived = result.bytesReceived;

                kilobytes = bytes / 1024;
                // getStatsResult.video[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
                getStatsResult.video.bytesReceived = kilobytes.toFixed(1);
            }

            if (!!result.availableOutgoingBitrate) {
                var kilobytes = 0;
                if (!getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate) {
                    getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate = result.availableOutgoingBitrate;
                }

                var bytes = result.availableOutgoingBitrate - getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate;
                getStatsResult.internal.video[sendrecvType].prevAvailableOutgoingBitrate = result.availableOutgoingBitrate;

                kilobytes = bytes / 1024;
                // getStatsResult.video[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
                getStatsResult.video.availableOutgoingBitrate = kilobytes.toFixed(1);
            }

            if (!!result.availableIncomingBitrate) {
                var kilobytes = 0;
                if (!getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate) {
                    getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate = result.availableIncomingBitrate;
                }

                var bytes = result.availableIncomingBitrate - getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate;
                getStatsResult.internal.video[sendrecvType].prevAvailableIncomingBitrate = result.availableIncomingBitrate;

                kilobytes = bytes / 1024;
                // getStatsResult.video[sendrecvType].availableBandwidth = kilobytes.toFixed(1);
                getStatsResult.video.availableIncomingBitrate = kilobytes.toFixed(1);
            }
        }
    };

    var LOCAL_candidateType = {};
    var LOCAL_transport = {};
    var LOCAL_ipAddress = {};
    var LOCAL_networkType = {};

    getStatsParser.localcandidate = function(result) {
        if (result.type !== 'localcandidate' && result.type !== 'local-candidate') return;
        if (!result.id) return;

        if (!LOCAL_candidateType[result.id]) {
            LOCAL_candidateType[result.id] = [];
        }

        if (!LOCAL_transport[result.id]) {
            LOCAL_transport[result.id] = [];
        }

        if (!LOCAL_ipAddress[result.id]) {
            LOCAL_ipAddress[result.id] = [];
        }

        if (!LOCAL_networkType[result.id]) {
            LOCAL_networkType[result.id] = [];
        }

        if (result.candidateType && LOCAL_candidateType[result.id].indexOf(result.candidateType) === -1) {
            LOCAL_candidateType[result.id].push(result.candidateType);
        }

        if (result.transport && LOCAL_transport[result.id].indexOf(result.transport) === -1) {
            LOCAL_transport[result.id].push(result.transport);
        }

        if (result.ipAddress && LOCAL_ipAddress[result.id].indexOf(result.ipAddress + ':' + result.portNumber) === -1) {
            LOCAL_ipAddress[result.id].push(result.ipAddress + ':' + result.portNumber);
        }

        if (result.networkType && LOCAL_networkType[result.id].indexOf(result.networkType) === -1) {
            LOCAL_networkType[result.id].push(result.networkType);
        }

        getStatsResult.internal.candidates[result.id] = {
            candidateType: LOCAL_candidateType[result.id],
            ipAddress: LOCAL_ipAddress[result.id],
            portNumber: result.portNumber,
            networkType: LOCAL_networkType[result.id],
            priority: result.priority,
            transport: LOCAL_transport[result.id],
            timestamp: result.timestamp,
            id: result.id,
            type: result.type
        };

        getStatsResult.connectionType.local.candidateType = LOCAL_candidateType[result.id];
        getStatsResult.connectionType.local.ipAddress = LOCAL_ipAddress[result.id];
        getStatsResult.connectionType.local.networkType = LOCAL_networkType[result.id];
        getStatsResult.connectionType.local.transport = LOCAL_transport[result.id];
    };

    var REMOTE_candidateType = {};
    var REMOTE_transport = {};
    var REMOTE_ipAddress = {};
    var REMOTE_networkType = {};

    getStatsParser.remotecandidate = function(result) {
        if (result.type !== 'remotecandidate' && result.type !== 'remote-candidate') return;
        if (!result.id) return;

        if (!REMOTE_candidateType[result.id]) {
            REMOTE_candidateType[result.id] = [];
        }

        if (!REMOTE_transport[result.id]) {
            REMOTE_transport[result.id] = [];
        }

        if (!REMOTE_ipAddress[result.id]) {
            REMOTE_ipAddress[result.id] = [];
        }

        if (!REMOTE_networkType[result.id]) {
            REMOTE_networkType[result.id] = [];
        }

        if (result.candidateType && REMOTE_candidateType[result.id].indexOf(result.candidateType) === -1) {
            REMOTE_candidateType[result.id].push(result.candidateType);
        }

        if (result.transport && REMOTE_transport[result.id].indexOf(result.transport) === -1) {
            REMOTE_transport[result.id].push(result.transport);
        }

        if (result.ipAddress && REMOTE_ipAddress[result.id].indexOf(result.ipAddress + ':' + result.portNumber) === -1) {
            REMOTE_ipAddress[result.id].push(result.ipAddress + ':' + result.portNumber);
        }

        if (result.networkType && REMOTE_networkType[result.id].indexOf(result.networkType) === -1) {
            REMOTE_networkType[result.id].push(result.networkType);
        }

        getStatsResult.internal.candidates[result.id] = {
            candidateType: REMOTE_candidateType[result.id],
            ipAddress: REMOTE_ipAddress[result.id],
            portNumber: result.portNumber,
            networkType: REMOTE_networkType[result.id],
            priority: result.priority,
            transport: REMOTE_transport[result.id],
            timestamp: result.timestamp,
            id: result.id,
            type: result.type
        };

        getStatsResult.connectionType.remote.candidateType = REMOTE_candidateType[result.id];
        getStatsResult.connectionType.remote.ipAddress = REMOTE_ipAddress[result.id];
        getStatsResult.connectionType.remote.networkType = REMOTE_networkType[result.id];
        getStatsResult.connectionType.remote.transport = REMOTE_transport[result.id];
    };

    getStatsParser.dataSentReceived = function(result) {
        if (!result.googCodecName || (result.mediaType !== 'video' && result.mediaType !== 'audio')) return;

        if (!!result.bytesSent) {
            getStatsResult[result.mediaType].bytesSent = parseInt(result.bytesSent);
        }

        if (!!result.bytesReceived) {
            getStatsResult[result.mediaType].bytesReceived = parseInt(result.bytesReceived);
        }
    };

    getStatsParser.inboundrtp = function(result) {
        if (!isSafari) return;
        if (result.type !== 'inbound-rtp') return;

        var mediaType = result.mediaType || 'audio';
        var sendrecvType = result.isRemote ? 'recv' : 'send';

        if (!sendrecvType) return;

        if (!!result.bytesSent) {
            var kilobytes = 0;
            if (!getStatsResult.internal[mediaType][sendrecvType].prevBytesSent) {
                getStatsResult.internal[mediaType][sendrecvType].prevBytesSent = result.bytesSent;
            }

            var bytes = result.bytesSent - getStatsResult.internal[mediaType][sendrecvType].prevBytesSent;
            getStatsResult.internal[mediaType][sendrecvType].prevBytesSent = result.bytesSent;

            kilobytes = bytes / 1024;

            getStatsResult[mediaType][sendrecvType].availableBandwidth = kilobytes.toFixed(1);
            getStatsResult[mediaType].bytesSent = kilobytes.toFixed(1);
        }

        if (!!result.bytesReceived) {
            var kilobytes = 0;
            if (!getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived) {
                getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived = result.bytesReceived;
            }

            var bytes = result.bytesReceived - getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived;
            getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived = result.bytesReceived;

            kilobytes = bytes / 1024;
            // getStatsResult[mediaType][sendrecvType].availableBandwidth = kilobytes.toFixed(1);
            getStatsResult[mediaType].bytesReceived = kilobytes.toFixed(1);
        }
    };

    getStatsParser.outboundrtp = function(result) {
        if (!isSafari) return;
        if (result.type !== 'outbound-rtp') return;

        var mediaType = result.mediaType || 'audio';
        var sendrecvType = result.isRemote ? 'recv' : 'send';

        if (!sendrecvType) return;

        if (!!result.bytesSent) {
            var kilobytes = 0;
            if (!getStatsResult.internal[mediaType][sendrecvType].prevBytesSent) {
                getStatsResult.internal[mediaType][sendrecvType].prevBytesSent = result.bytesSent;
            }

            var bytes = result.bytesSent - getStatsResult.internal[mediaType][sendrecvType].prevBytesSent;
            getStatsResult.internal[mediaType][sendrecvType].prevBytesSent = result.bytesSent;

            kilobytes = bytes / 1024;

            getStatsResult[mediaType][sendrecvType].availableBandwidth = kilobytes.toFixed(1);
            getStatsResult[mediaType].bytesSent = kilobytes.toFixed(1);
        }

        if (!!result.bytesReceived) {
            var kilobytes = 0;
            if (!getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived) {
                getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived = result.bytesReceived;
            }

            var bytes = result.bytesReceived - getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived;
            getStatsResult.internal[mediaType][sendrecvType].prevBytesReceived = result.bytesReceived;

            kilobytes = bytes / 1024;
            // getStatsResult[mediaType][sendrecvType].availableBandwidth = kilobytes.toFixed(1);
            getStatsResult[mediaType].bytesReceived = kilobytes.toFixed(1);
        }
    };

    getStatsParser.track = function(result) {
        if (!isSafari) return;
        if (result.type !== 'track') return;

        var sendrecvType = result.remoteSource === true ? 'send' : 'recv';

        if (result.frameWidth && result.frameHeight) {
            getStatsResult.resolutions[sendrecvType].width = result.frameWidth;
            getStatsResult.resolutions[sendrecvType].height = result.frameHeight;
        }

        // framesSent, framesReceived
    };

    var SSRC = {
        audio: {
            send: [],
            recv: []
        },
        video: {
            send: [],
            recv: []
        }
    };

    getStatsParser.ssrc = function(result) {
        if (!result.googCodecName || (result.mediaType !== 'video' && result.mediaType !== 'audio')) return;
        if (result.type !== 'ssrc') return;
        var sendrecvType = result.id.split('_').pop();

        if (SSRC[result.mediaType][sendrecvType].indexOf(result.ssrc) === -1) {
            SSRC[result.mediaType][sendrecvType].push(result.ssrc)
        }

        getStatsResult[result.mediaType][sendrecvType].streams = SSRC[result.mediaType][sendrecvType].length;
    };

    getStatsLooper();

};
