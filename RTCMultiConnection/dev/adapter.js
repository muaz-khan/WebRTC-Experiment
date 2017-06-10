(function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        g.adapter = f()
    }
})(function() {
    var define, module, exports;
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {
                    exports: {}
                };
                t[o][0].call(l.exports, function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s
    })({
        1: [function(require, module, exports) {
            /* eslint-env node */
            'use strict';

            // SDP helpers.
            var SDPUtils = {};

            // Generate an alphanumeric identifier for cname or mids.
            // TODO: use UUIDs instead? https://gist.github.com/jed/982883
            SDPUtils.generateIdentifier = function() {
                return Math.random().toString(36).substr(2, 10);
            };

            // The RTCP CNAME used by all peerconnections from the same JS.
            SDPUtils.localCName = SDPUtils.generateIdentifier();

            // Splits SDP into lines, dealing with both CRLF and LF.
            SDPUtils.splitLines = function(blob) {
                return blob.trim().split('\n').map(function(line) {
                    return line.trim();
                });
            };
            // Splits SDP into sessionpart and mediasections. Ensures CRLF.
            SDPUtils.splitSections = function(blob) {
                var parts = blob.split('\nm=');
                return parts.map(function(part, index) {
                    return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
                });
            };

            // Returns lines that start with a certain prefix.
            SDPUtils.matchPrefix = function(blob, prefix) {
                return SDPUtils.splitLines(blob).filter(function(line) {
                    return line.indexOf(prefix) === 0;
                });
            };

            // Parses an ICE candidate line. Sample input:
            // candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
            // rport 55996"
            SDPUtils.parseCandidate = function(line) {
                var parts;
                // Parse both variants.
                if (line.indexOf('a=candidate:') === 0) {
                    parts = line.substring(12).split(' ');
                } else {
                    parts = line.substring(10).split(' ');
                }

                var candidate = {
                    foundation: parts[0],
                    component: parts[1],
                    protocol: parts[2].toLowerCase(),
                    priority: parseInt(parts[3], 10),
                    ip: parts[4],
                    port: parseInt(parts[5], 10),
                    // skip parts[6] == 'typ'
                    type: parts[7]
                };

                for (var i = 8; i < parts.length; i += 2) {
                    switch (parts[i]) {
                        case 'raddr':
                            candidate.relatedAddress = parts[i + 1];
                            break;
                        case 'rport':
                            candidate.relatedPort = parseInt(parts[i + 1], 10);
                            break;
                        case 'tcptype':
                            candidate.tcpType = parts[i + 1];
                            break;
                        default: // Unknown extensions are silently ignored.
                            break;
                    }
                }
                return candidate;
            };

            // Translates a candidate object into SDP candidate attribute.
            SDPUtils.writeCandidate = function(candidate) {
                var sdp = [];
                sdp.push(candidate.foundation);
                sdp.push(candidate.component);
                sdp.push(candidate.protocol.toUpperCase());
                sdp.push(candidate.priority);
                sdp.push(candidate.ip);
                sdp.push(candidate.port);

                var type = candidate.type;
                sdp.push('typ');
                sdp.push(type);
                if (type !== 'host' && candidate.relatedAddress &&
                    candidate.relatedPort) {
                    sdp.push('raddr');
                    sdp.push(candidate.relatedAddress); // was: relAddr
                    sdp.push('rport');
                    sdp.push(candidate.relatedPort); // was: relPort
                }
                if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
                    sdp.push('tcptype');
                    sdp.push(candidate.tcpType);
                }
                return 'candidate:' + sdp.join(' ');
            };

            // Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
            // a=rtpmap:111 opus/48000/2
            SDPUtils.parseRtpMap = function(line) {
                var parts = line.substr(9).split(' ');
                var parsed = {
                    payloadType: parseInt(parts.shift(), 10) // was: id
                };

                parts = parts[0].split('/');

                parsed.name = parts[0];
                parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
                // was: channels
                parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
                return parsed;
            };

            // Generate an a=rtpmap line from RTCRtpCodecCapability or
            // RTCRtpCodecParameters.
            SDPUtils.writeRtpMap = function(codec) {
                var pt = codec.payloadType;
                if (codec.preferredPayloadType !== undefined) {
                    pt = codec.preferredPayloadType;
                }
                return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
                    (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
            };

            // Parses an a=extmap line (headerextension from RFC 5285). Sample input:
            // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
            SDPUtils.parseExtmap = function(line) {
                var parts = line.substr(9).split(' ');
                return {
                    id: parseInt(parts[0], 10),
                    uri: parts[1]
                };
            };

            // Generates a=extmap line from RTCRtpHeaderExtensionParameters or
            // RTCRtpHeaderExtension.
            SDPUtils.writeExtmap = function(headerExtension) {
                return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
                    ' ' + headerExtension.uri + '\r\n';
            };

            // Parses an ftmp line, returns dictionary. Sample input:
            // a=fmtp:96 vbr=on;cng=on
            // Also deals with vbr=on; cng=on
            SDPUtils.parseFmtp = function(line) {
                var parsed = {};
                var kv;
                var parts = line.substr(line.indexOf(' ') + 1).split(';');
                for (var j = 0; j < parts.length; j++) {
                    kv = parts[j].trim().split('=');
                    parsed[kv[0].trim()] = kv[1];
                }
                return parsed;
            };

            // Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
            SDPUtils.writeFmtp = function(codec) {
                var line = '';
                var pt = codec.payloadType;
                if (codec.preferredPayloadType !== undefined) {
                    pt = codec.preferredPayloadType;
                }
                if (codec.parameters && Object.keys(codec.parameters).length) {
                    var params = [];
                    Object.keys(codec.parameters).forEach(function(param) {
                        params.push(param + '=' + codec.parameters[param]);
                    });
                    line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
                }
                return line;
            };

            // Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
            // a=rtcp-fb:98 nack rpsi
            SDPUtils.parseRtcpFb = function(line) {
                var parts = line.substr(line.indexOf(' ') + 1).split(' ');
                return {
                    type: parts.shift(),
                    parameter: parts.join(' ')
                };
            };
            // Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
            SDPUtils.writeRtcpFb = function(codec) {
                var lines = '';
                var pt = codec.payloadType;
                if (codec.preferredPayloadType !== undefined) {
                    pt = codec.preferredPayloadType;
                }
                if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
                    // FIXME: special handling for trr-int?
                    codec.rtcpFeedback.forEach(function(fb) {
                        lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
                            (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
                            '\r\n';
                    });
                }
                return lines;
            };

            // Parses an RFC 5576 ssrc media attribute. Sample input:
            // a=ssrc:3735928559 cname:something
            SDPUtils.parseSsrcMedia = function(line) {
                var sp = line.indexOf(' ');
                var parts = {
                    ssrc: parseInt(line.substr(7, sp - 7), 10)
                };
                var colon = line.indexOf(':', sp);
                if (colon > -1) {
                    parts.attribute = line.substr(sp + 1, colon - sp - 1);
                    parts.value = line.substr(colon + 1);
                } else {
                    parts.attribute = line.substr(sp + 1);
                }
                return parts;
            };

            // Extracts the MID (RFC 5888) from a media section.
            // returns the MID or undefined if no mid line was found.
            SDPUtils.getMid = function(mediaSection) {
                var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
                if (mid) {
                    return mid.substr(6);
                }
            }

            // Extracts DTLS parameters from SDP media section or sessionpart.
            // FIXME: for consistency with other functions this should only
            //   get the fingerprint line as input. See also getIceParameters.
            SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
                var lines = SDPUtils.splitLines(mediaSection);
                // Search in session part, too.
                lines = lines.concat(SDPUtils.splitLines(sessionpart));
                var fpLine = lines.filter(function(line) {
                    return line.indexOf('a=fingerprint:') === 0;
                })[0].substr(14);
                // Note: a=setup line is ignored since we use the 'auto' role.
                // Note2: 'algorithm' is not case sensitive except in Edge.
                var dtlsParameters = {
                    role: 'auto',
                    fingerprints: [{
                        algorithm: fpLine.split(' ')[0].toLowerCase(),
                        value: fpLine.split(' ')[1]
                    }]
                };
                return dtlsParameters;
            };

            // Serializes DTLS parameters to SDP.
            SDPUtils.writeDtlsParameters = function(params, setupType) {
                var sdp = 'a=setup:' + setupType + '\r\n';
                params.fingerprints.forEach(function(fp) {
                    sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
                });
                return sdp;
            };
            // Parses ICE information from SDP media section or sessionpart.
            // FIXME: for consistency with other functions this should only
            //   get the ice-ufrag and ice-pwd lines as input.
            SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
                var lines = SDPUtils.splitLines(mediaSection);
                // Search in session part, too.
                lines = lines.concat(SDPUtils.splitLines(sessionpart));
                var iceParameters = {
                    usernameFragment: lines.filter(function(line) {
                        return line.indexOf('a=ice-ufrag:') === 0;
                    })[0].substr(12),
                    password: lines.filter(function(line) {
                        return line.indexOf('a=ice-pwd:') === 0;
                    })[0].substr(10)
                };
                return iceParameters;
            };

            // Serializes ICE parameters to SDP.
            SDPUtils.writeIceParameters = function(params) {
                return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
                    'a=ice-pwd:' + params.password + '\r\n';
            };

            // Parses the SDP media section and returns RTCRtpParameters.
            SDPUtils.parseRtpParameters = function(mediaSection) {
                var description = {
                    codecs: [],
                    headerExtensions: [],
                    fecMechanisms: [],
                    rtcp: []
                };
                var lines = SDPUtils.splitLines(mediaSection);
                var mline = lines[0].split(' ');
                for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
                    var pt = mline[i];
                    var rtpmapline = SDPUtils.matchPrefix(
                        mediaSection, 'a=rtpmap:' + pt + ' ')[0];
                    if (rtpmapline) {
                        var codec = SDPUtils.parseRtpMap(rtpmapline);
                        var fmtps = SDPUtils.matchPrefix(
                            mediaSection, 'a=fmtp:' + pt + ' ');
                        // Only the first a=fmtp:<pt> is considered.
                        codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
                        codec.rtcpFeedback = SDPUtils.matchPrefix(
                                mediaSection, 'a=rtcp-fb:' + pt + ' ')
                            .map(SDPUtils.parseRtcpFb);
                        description.codecs.push(codec);
                        // parse FEC mechanisms from rtpmap lines.
                        switch (codec.name.toUpperCase()) {
                            case 'RED':
                            case 'ULPFEC':
                                description.fecMechanisms.push(codec.name.toUpperCase());
                                break;
                            default: // only RED and ULPFEC are recognized as FEC mechanisms.
                                break;
                        }
                    }
                }
                SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
                    description.headerExtensions.push(SDPUtils.parseExtmap(line));
                });
                // FIXME: parse rtcp.
                return description;
            };

            // Generates parts of the SDP media section describing the capabilities /
            // parameters.
            SDPUtils.writeRtpDescription = function(kind, caps) {
                var sdp = '';

                // Build the mline.
                sdp += 'm=' + kind + ' ';
                sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
                sdp += ' UDP/TLS/RTP/SAVPF ';
                sdp += caps.codecs.map(function(codec) {
                    if (codec.preferredPayloadType !== undefined) {
                        return codec.preferredPayloadType;
                    }
                    return codec.payloadType;
                }).join(' ') + '\r\n';

                sdp += 'c=IN IP4 0.0.0.0\r\n';
                sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

                // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
                caps.codecs.forEach(function(codec) {
                    sdp += SDPUtils.writeRtpMap(codec);
                    sdp += SDPUtils.writeFmtp(codec);
                    sdp += SDPUtils.writeRtcpFb(codec);
                });
                var maxptime = 0;
                caps.codecs.forEach(function(codec) {
                    if (codec.maxptime > maxptime) {
                        maxptime = codec.maxptime;
                    }
                });
                if (maxptime > 0) {
                    sdp += 'a=maxptime:' + maxptime + '\r\n';
                }
                sdp += 'a=rtcp-mux\r\n';

                caps.headerExtensions.forEach(function(extension) {
                    sdp += SDPUtils.writeExtmap(extension);
                });
                // FIXME: write fecMechanisms.
                return sdp;
            };

            // Parses the SDP media section and returns an array of
            // RTCRtpEncodingParameters.
            SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
                var encodingParameters = [];
                var description = SDPUtils.parseRtpParameters(mediaSection);
                var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
                var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

                // filter a=ssrc:... cname:, ignore PlanB-msid
                var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
                    .map(function(line) {
                        return SDPUtils.parseSsrcMedia(line);
                    })
                    .filter(function(parts) {
                        return parts.attribute === 'cname';
                    });
                var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
                var secondarySsrc;

                var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
                    .map(function(line) {
                        var parts = line.split(' ');
                        parts.shift();
                        return parts.map(function(part) {
                            return parseInt(part, 10);
                        });
                    });
                if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
                    secondarySsrc = flows[0][1];
                }

                description.codecs.forEach(function(codec) {
                    if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
                        var encParam = {
                            ssrc: primarySsrc,
                            codecPayloadType: parseInt(codec.parameters.apt, 10),
                            rtx: {
                                ssrc: secondarySsrc
                            }
                        };
                        encodingParameters.push(encParam);
                        if (hasRed) {
                            encParam = JSON.parse(JSON.stringify(encParam));
                            encParam.fec = {
                                ssrc: secondarySsrc,
                                mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
                            };
                            encodingParameters.push(encParam);
                        }
                    }
                });
                if (encodingParameters.length === 0 && primarySsrc) {
                    encodingParameters.push({
                        ssrc: primarySsrc
                    });
                }

                // we support both b=AS and b=TIAS but interpret AS as TIAS.
                var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
                if (bandwidth.length) {
                    if (bandwidth[0].indexOf('b=TIAS:') === 0) {
                        bandwidth = parseInt(bandwidth[0].substr(7), 10);
                    } else if (bandwidth[0].indexOf('b=AS:') === 0) {
                        bandwidth = parseInt(bandwidth[0].substr(5), 10);
                    }
                    encodingParameters.forEach(function(params) {
                        params.maxBitrate = bandwidth;
                    });
                }
                return encodingParameters;
            };

            // parses http://draft.ortc.org/#rtcrtcpparameters*
            SDPUtils.parseRtcpParameters = function(mediaSection) {
                var rtcpParameters = {};

                var cname;
                // Gets the first SSRC. Note that with RTX there might be multiple
                // SSRCs.
                var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
                    .map(function(line) {
                        return SDPUtils.parseSsrcMedia(line);
                    })
                    .filter(function(obj) {
                        return obj.attribute === 'cname';
                    })[0];
                if (remoteSsrc) {
                    rtcpParameters.cname = remoteSsrc.value;
                    rtcpParameters.ssrc = remoteSsrc.ssrc;
                }

                // Edge uses the compound attribute instead of reducedSize
                // compound is !reducedSize
                var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
                rtcpParameters.reducedSize = rsize.length > 0;
                rtcpParameters.compound = rsize.length === 0;

                // parses the rtcp-mux attrіbute.
                // Note that Edge does not support unmuxed RTCP.
                var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
                rtcpParameters.mux = mux.length > 0;

                return rtcpParameters;
            };

            // parses either a=msid: or a=ssrc:... msid lines an returns
            // the id of the MediaStream and MediaStreamTrack.
            SDPUtils.parseMsid = function(mediaSection) {
                var parts;
                var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
                if (spec.length === 1) {
                    parts = spec[0].substr(7).split(' ');
                    return {
                        stream: parts[0],
                        track: parts[1]
                    };
                }
                var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
                    .map(function(line) {
                        return SDPUtils.parseSsrcMedia(line);
                    })
                    .filter(function(parts) {
                        return parts.attribute === 'msid';
                    });
                if (planB.length > 0) {
                    parts = planB[0].value.split(' ');
                    return {
                        stream: parts[0],
                        track: parts[1]
                    };
                }
            };

            SDPUtils.writeSessionBoilerplate = function() {
                // FIXME: sess-id should be an NTP timestamp.
                return 'v=0\r\n' +
                    'o=thisisadapterortc 8169639915646943137 2 IN IP4 127.0.0.1\r\n' +
                    's=-\r\n' +
                    't=0 0\r\n';
            };

            SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
                var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

                // Map ICE parameters (ufrag, pwd) to SDP.
                sdp += SDPUtils.writeIceParameters(
                    transceiver.iceGatherer.getLocalParameters());

                // Map DTLS parameters to SDP.
                sdp += SDPUtils.writeDtlsParameters(
                    transceiver.dtlsTransport.getLocalParameters(),
                    type === 'offer' ? 'actpass' : 'active');

                sdp += 'a=mid:' + transceiver.mid + '\r\n';

                if (transceiver.rtpSender && transceiver.rtpReceiver) {
                    sdp += 'a=sendrecv\r\n';
                } else if (transceiver.rtpSender) {
                    sdp += 'a=sendonly\r\n';
                } else if (transceiver.rtpReceiver) {
                    sdp += 'a=recvonly\r\n';
                } else {
                    sdp += 'a=inactive\r\n';
                }

                if (transceiver.rtpSender) {
                    // spec.
                    var msid = 'msid:' + stream.id + ' ' +
                        transceiver.rtpSender.track.id + '\r\n';
                    sdp += 'a=' + msid;

                    // for Chrome.
                    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
                        ' ' + msid;
                    if (transceiver.sendEncodingParameters[0].rtx) {
                        sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
                            ' ' + msid;
                        sdp += 'a=ssrc-group:FID ' +
                            transceiver.sendEncodingParameters[0].ssrc + ' ' +
                            transceiver.sendEncodingParameters[0].rtx.ssrc +
                            '\r\n';
                    }
                }
                // FIXME: this should be written by writeRtpDescription.
                sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
                    ' cname:' + SDPUtils.localCName + '\r\n';
                if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
                    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
                        ' cname:' + SDPUtils.localCName + '\r\n';
                }
                return sdp;
            };

            // Gets the direction from the mediaSection or the sessionpart.
            SDPUtils.getDirection = function(mediaSection, sessionpart) {
                // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
                var lines = SDPUtils.splitLines(mediaSection);
                for (var i = 0; i < lines.length; i++) {
                    switch (lines[i]) {
                        case 'a=sendrecv':
                        case 'a=sendonly':
                        case 'a=recvonly':
                        case 'a=inactive':
                            return lines[i].substr(2);
                        default:
                            // FIXME: What should happen here?
                    }
                }
                if (sessionpart) {
                    return SDPUtils.getDirection(sessionpart);
                }
                return 'sendrecv';
            };

            SDPUtils.getKind = function(mediaSection) {
                var lines = SDPUtils.splitLines(mediaSection);
                var mline = lines[0].split(' ');
                return mline[0].substr(2);
            };

            SDPUtils.isRejected = function(mediaSection) {
                return mediaSection.split(' ', 2)[1] === '0';
            };

            // Expose public methods.
            module.exports = SDPUtils;

        }, {}],
        2: [function(require, module, exports) {
            /*
             *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
             *
             *  Use of this source code is governed by a BSD-style license
             *  that can be found in the LICENSE file in the root of the source
             *  tree.
             */
            /* eslint-env node */

            'use strict';

            // Shimming starts here.
            (function() {
                // Utils.
                var utils = require('./utils');
                var logging = utils.log;
                var browserDetails = utils.browserDetails;
                // Export to the adapter global object visible in the browser.
                module.exports.browserDetails = browserDetails;
                module.exports.extractVersion = utils.extractVersion;
                module.exports.disableLog = utils.disableLog;

                // Uncomment the line below if you want logging to occur, including logging
                // for the switch statement below. Can also be turned on in the browser via
                // adapter.disableLog(false), but then logging from the switch statement below
                // will not appear.
                // require('./utils').disableLog(false);

                // Browser shims.
                var chromeShim = require('./chrome/chrome_shim') || null;
                var edgeShim = require('./edge/edge_shim') || null;
                var firefoxShim = require('./firefox/firefox_shim') || null;
                var safariShim = require('./safari/safari_shim') || null;

                // Shim browser if found.
                switch (browserDetails.browser) {
                    case 'chrome':
                        if (!chromeShim || !chromeShim.shimPeerConnection) {
                            logging('Chrome shim is not included in this adapter release.');
                            return;
                        }
                        logging('adapter.js shimming chrome.');
                        // Export to the adapter global object visible in the browser.
                        module.exports.browserShim = chromeShim;

                        chromeShim.shimGetUserMedia();
                        chromeShim.shimMediaStream();
                        utils.shimCreateObjectURL();
                        chromeShim.shimSourceObject();
                        chromeShim.shimPeerConnection();
                        chromeShim.shimOnTrack();
                        chromeShim.shimGetSendersWithDtmf();
                        break;
                    case 'firefox':
                        if (!firefoxShim || !firefoxShim.shimPeerConnection) {
                            logging('Firefox shim is not included in this adapter release.');
                            return;
                        }
                        logging('adapter.js shimming firefox.');
                        // Export to the adapter global object visible in the browser.
                        module.exports.browserShim = firefoxShim;

                        firefoxShim.shimGetUserMedia();
                        utils.shimCreateObjectURL();
                        firefoxShim.shimSourceObject();
                        firefoxShim.shimPeerConnection();
                        firefoxShim.shimOnTrack();
                        break;
                    case 'edge':
                        if (!edgeShim || !edgeShim.shimPeerConnection) {
                            logging('MS edge shim is not included in this adapter release.');
                            return;
                        }
                        logging('adapter.js shimming edge.');
                        // Export to the adapter global object visible in the browser.
                        module.exports.browserShim = edgeShim;

                        edgeShim.shimGetUserMedia();
                        utils.shimCreateObjectURL();
                        edgeShim.shimPeerConnection();
                        edgeShim.shimReplaceTrack();
                        break;
                    case 'safari':
                        if (!safariShim) {
                            logging('Safari shim is not included in this adapter release.');
                            return;
                        }
                        logging('adapter.js shimming safari.');
                        // Export to the adapter global object visible in the browser.
                        module.exports.browserShim = safariShim;

                        safariShim.shimOnAddStream();
                        safariShim.shimGetUserMedia();
                        break;
                    default:
                        logging('Unsupported browser!');
                }
            })();

        }, {
            "./chrome/chrome_shim": 3,
            "./edge/edge_shim": 5,
            "./firefox/firefox_shim": 8,
            "./safari/safari_shim": 10,
            "./utils": 11
        }],
        3: [function(require, module, exports) {

            /*
             *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
             *
             *  Use of this source code is governed by a BSD-style license
             *  that can be found in the LICENSE file in the root of the source
             *  tree.
             */
            /* eslint-env node */
            'use strict';
            var logging = require('../utils.js').log;
            var browserDetails = require('../utils.js').browserDetails;

            var chromeShim = {
                shimMediaStream: function() {
                    window.MediaStream = window.MediaStream || window.webkitMediaStream;
                },

                shimOnTrack: function() {
                    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
                            window.RTCPeerConnection.prototype)) {
                        Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
                            get: function() {
                                return this._ontrack;
                            },
                            set: function(f) {
                                var self = this;
                                if (this._ontrack) {
                                    this.removeEventListener('track', this._ontrack);
                                    this.removeEventListener('addstream', this._ontrackpoly);
                                }
                                this.addEventListener('track', this._ontrack = f);
                                this.addEventListener('addstream', this._ontrackpoly = function(e) {
                                    // onaddstream does not fire when a track is added to an existing
                                    // stream. But stream.onaddtrack is implemented so we use that.
                                    e.stream.addEventListener('addtrack', function(te) {
                                        var event = new Event('track');
                                        event.track = te.track;
                                        event.receiver = {
                                            track: te.track
                                        };
                                        event.streams = [e.stream];
                                        self.dispatchEvent(event);
                                    });
                                    e.stream.getTracks().forEach(function(track) {
                                        var event = new Event('track');
                                        event.track = track;
                                        event.receiver = {
                                            track: track
                                        };
                                        event.streams = [e.stream];
                                        this.dispatchEvent(event);
                                    }.bind(this));
                                }.bind(this));
                            }
                        });
                    }
                },

                shimGetSendersWithDtmf: function() {
                    if (typeof window === 'object' && window.RTCPeerConnection &&
                        !('getSenders' in RTCPeerConnection.prototype) &&
                        'createDTMFSender' in RTCPeerConnection.prototype) {
                        RTCPeerConnection.prototype.getSenders = function() {
                            return this._senders;
                        };
                        var origAddStream = RTCPeerConnection.prototype.addStream;
                        var origRemoveStream = RTCPeerConnection.prototype.removeStream;

                        RTCPeerConnection.prototype.addStream = function(stream) {
                            var pc = this;
                            pc._senders = pc._senders || [];
                            origAddStream.apply(pc, [stream]);
                            stream.getTracks().forEach(function(track) {
                                pc._senders.push({
                                    track: track,
                                    get dtmf() {
                                        if (this._dtmf === undefined) {
                                            if (track.kind === 'audio') {
                                                this._dtmf = pc.createDTMFSender(track);
                                            } else {
                                                this._dtmf = null;
                                            }
                                        }
                                        return this._dtmf;
                                    }
                                });
                            });
                        };

                        RTCPeerConnection.prototype.removeStream = function(stream) {
                            var pc = this;
                            pc._senders = pc._senders || [];
                            origRemoveStream.apply(pc, [stream]);
                            stream.getTracks().forEach(function(track) {
                                var sender = pc._senders.find(function(s) {
                                    return s.track === track;
                                });
                                if (sender) {
                                    pc._senders.splice(pc._senders.indexOf(sender), 1); // remove sender
                                }
                            });
                        };
                    }
                },

                shimSourceObject: function() {
                    if (typeof window === 'object') {
                        if (window.HTMLMediaElement &&
                            !('srcObject' in window.HTMLMediaElement.prototype)) {
                            // Shim the srcObject property, once, when HTMLMediaElement is found.
                            Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
                                get: function() {
                                    return this._srcObject;
                                },
                                set: function(stream) {
                                    var self = this;
                                    // Use _srcObject as a private property for this shim
                                    this._srcObject = stream;
                                    if (this.src) {
                                        URL.revokeObjectURL(this.src);
                                    }

                                    if (!stream) {
                                        this.src = '';
                                        return undefined;
                                    }
                                    this.src = URL.createObjectURL(stream);
                                    // We need to recreate the blob url when a track is added or
                                    // removed. Doing it manually since we want to avoid a recursion.
                                    stream.addEventListener('addtrack', function() {
                                        if (self.src) {
                                            URL.revokeObjectURL(self.src);
                                        }
                                        self.src = URL.createObjectURL(stream);
                                    });
                                    stream.addEventListener('removetrack', function() {
                                        if (self.src) {
                                            URL.revokeObjectURL(self.src);
                                        }
                                        self.src = URL.createObjectURL(stream);
                                    });
                                }
                            });
                        }
                    }
                },

                shimPeerConnection: function() {
                    // The RTCPeerConnection object.
                    if (!window.RTCPeerConnection) {
                        window.RTCPeerConnection = function(pcConfig, pcConstraints) {
                            // Translate iceTransportPolicy to iceTransports,
                            // see https://code.google.com/p/webrtc/issues/detail?id=4869
                            // this was fixed in M56 along with unprefixing RTCPeerConnection.
                            logging('PeerConnection');
                            if (pcConfig && pcConfig.iceTransportPolicy) {
                                pcConfig.iceTransports = pcConfig.iceTransportPolicy;
                            }

                            return new webkitRTCPeerConnection(pcConfig, pcConstraints);
                        };
                        window.RTCPeerConnection.prototype = webkitRTCPeerConnection.prototype;
                        // wrap static methods. Currently just generateCertificate.
                        if (webkitRTCPeerConnection.generateCertificate) {
                            Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                                get: function() {
                                    return webkitRTCPeerConnection.generateCertificate;
                                }
                            });
                        }
                    } else {
                        // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
                        var OrigPeerConnection = RTCPeerConnection;
                        window.RTCPeerConnection = function(pcConfig, pcConstraints) {
                            if (pcConfig && pcConfig.iceServers) {
                                var newIceServers = [];
                                for (var i = 0; i < pcConfig.iceServers.length; i++) {
                                    var server = pcConfig.iceServers[i];
                                    if (!server.hasOwnProperty('urls') &&
                                        server.hasOwnProperty('url')) {
                                        console.warn('RTCIceServer.url is deprecated! Use urls instead.');
                                        server = JSON.parse(JSON.stringify(server));
                                        server.urls = server.url;
                                        newIceServers.push(server);
                                    } else {
                                        newIceServers.push(pcConfig.iceServers[i]);
                                    }
                                }
                                pcConfig.iceServers = newIceServers;
                            }
                            return new OrigPeerConnection(pcConfig, pcConstraints);
                        };
                        window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
                        // wrap static methods. Currently just generateCertificate.
                        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                            get: function() {
                                return OrigPeerConnection.generateCertificate;
                            }
                        });
                    }

                    var origGetStats = RTCPeerConnection.prototype.getStats;
                    RTCPeerConnection.prototype.getStats = function(selector,
                        successCallback, errorCallback) {
                        var self = this;
                        var args = arguments;

                        // If selector is a function then we are in the old style stats so just
                        // pass back the original getStats format to avoid breaking old users.
                        if (arguments.length > 0 && typeof selector === 'function') {
                            return origGetStats.apply(this, arguments);
                        }

                        // When spec-style getStats is supported, return those when called with
                        // either no arguments or the selector argument is null.
                        if (origGetStats.length === 0 && (arguments.length === 0 ||
                                typeof arguments[0] !== 'function')) {
                            return origGetStats.apply(this, []);
                        }

                        var fixChromeStats_ = function(response) {
                            var standardReport = {};
                            var reports = response.result();
                            reports.forEach(function(report) {
                                var standardStats = {
                                    id: report.id,
                                    timestamp: report.timestamp,
                                    type: {
                                        localcandidate: 'local-candidate',
                                        remotecandidate: 'remote-candidate'
                                    }[report.type] || report.type
                                };
                                report.names().forEach(function(name) {
                                    standardStats[name] = report.stat(name);
                                });
                                standardReport[standardStats.id] = standardStats;
                            });

                            return standardReport;
                        };

                        // shim getStats with maplike support
                        var makeMapStats = function(stats) {
                            return new Map(Object.keys(stats).map(function(key) {
                                return [key, stats[key]];
                            }));
                        };

                        if (arguments.length >= 2) {
                            var successCallbackWrapper_ = function(response) {
                                args[1](makeMapStats(fixChromeStats_(response)));
                            };

                            return origGetStats.apply(this, [successCallbackWrapper_,
                                arguments[0]
                            ]);
                        }

                        // promise-support
                        return new Promise(function(resolve, reject) {
                            origGetStats.apply(self, [
                                function(response) {
                                    resolve(makeMapStats(fixChromeStats_(response)));
                                },
                                reject
                            ]);
                        }).then(successCallback, errorCallback);
                    };

                    // add promise support -- natively available in Chrome 51
                    if (browserDetails.version < 51) {
                        ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
                        .forEach(function(method) {
                            var nativeMethod = RTCPeerConnection.prototype[method];
                            RTCPeerConnection.prototype[method] = function() {
                                var args = arguments;
                                var self = this;
                                var promise = new Promise(function(resolve, reject) {
                                    nativeMethod.apply(self, [args[0], resolve, reject]);
                                });
                                if (args.length < 2) {
                                    return promise;
                                }
                                return promise.then(function() {
                                        args[1].apply(null, []);
                                    },
                                    function(err) {
                                        if (args.length >= 3) {
                                            args[2].apply(null, [err]);
                                        }
                                    });
                            };
                        });
                    }

                    // promise support for createOffer and createAnswer. Available (without
                    // bugs) since M52: crbug/619289
                    if (browserDetails.version < 52) {
                        ['createOffer', 'createAnswer'].forEach(function(method) {
                            var nativeMethod = RTCPeerConnection.prototype[method];
                            RTCPeerConnection.prototype[method] = function() {
                                var self = this;
                                if (arguments.length < 1 || (arguments.length === 1 &&
                                        typeof arguments[0] === 'object')) {
                                    var opts = arguments.length === 1 ? arguments[0] : undefined;
                                    return new Promise(function(resolve, reject) {
                                        nativeMethod.apply(self, [resolve, reject, opts]);
                                    });
                                }
                                return nativeMethod.apply(this, arguments);
                            };
                        });
                    }

                    // shim implicit creation of RTCSessionDescription/RTCIceCandidate
                    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
                    .forEach(function(method) {
                        var nativeMethod = RTCPeerConnection.prototype[method];
                        RTCPeerConnection.prototype[method] = function() {
                            arguments[0] = new((method === 'addIceCandidate') ?
                                RTCIceCandidate : RTCSessionDescription)(arguments[0]);
                            return nativeMethod.apply(this, arguments);
                        };
                    });

                    // support for addIceCandidate(null or undefined)
                    var nativeAddIceCandidate =
                        RTCPeerConnection.prototype.addIceCandidate;
                    RTCPeerConnection.prototype.addIceCandidate = function() {
                        if (!arguments[0]) {
                            if (arguments[1]) {
                                arguments[1].apply(null);
                            }
                            return Promise.resolve();
                        }
                        return nativeAddIceCandidate.apply(this, arguments);
                    };
                }
            };


            // Expose public methods.
            module.exports = {
                shimMediaStream: chromeShim.shimMediaStream,
                shimOnTrack: chromeShim.shimOnTrack,
                shimGetSendersWithDtmf: chromeShim.shimGetSendersWithDtmf,
                shimSourceObject: chromeShim.shimSourceObject,
                shimPeerConnection: chromeShim.shimPeerConnection,
                shimGetUserMedia: require('./getusermedia')
            };

        }, {
            "../utils.js": 11,
            "./getusermedia": 4
        }],
        4: [function(require, module, exports) {
            /*
             *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
             *
             *  Use of this source code is governed by a BSD-style license
             *  that can be found in the LICENSE file in the root of the source
             *  tree.
             */
            /* eslint-env node */
            'use strict';
            var logging = require('../utils.js').log;
            var browserDetails = require('../utils.js').browserDetails;

            // Expose public methods.
            module.exports = function() {
                var constraintsToChrome_ = function(c) {
                    if (typeof c !== 'object' || c.mandatory || c.optional) {
                        return c;
                    }
                    var cc = {};
                    Object.keys(c).forEach(function(key) {
                        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
                            return;
                        }
                        var r = (typeof c[key] === 'object') ? c[key] : {
                            ideal: c[key]
                        };
                        if (r.exact !== undefined && typeof r.exact === 'number') {
                            r.min = r.max = r.exact;
                        }
                        var oldname_ = function(prefix, name) {
                            if (prefix) {
                                return prefix + name.charAt(0).toUpperCase() + name.slice(1);
                            }
                            return (name === 'deviceId') ? 'sourceId' : name;
                        };
                        if (r.ideal !== undefined) {
                            cc.optional = cc.optional || [];
                            var oc = {};
                            if (typeof r.ideal === 'number') {
                                oc[oldname_('min', key)] = r.ideal;
                                cc.optional.push(oc);
                                oc = {};
                                oc[oldname_('max', key)] = r.ideal;
                                cc.optional.push(oc);
                            } else {
                                oc[oldname_('', key)] = r.ideal;
                                cc.optional.push(oc);
                            }
                        }
                        if (r.exact !== undefined && typeof r.exact !== 'number') {
                            cc.mandatory = cc.mandatory || {};
                            cc.mandatory[oldname_('', key)] = r.exact;
                        } else {
                            ['min', 'max'].forEach(function(mix) {
                                if (r[mix] !== undefined) {
                                    cc.mandatory = cc.mandatory || {};
                                    cc.mandatory[oldname_(mix, key)] = r[mix];
                                }
                            });
                        }
                    });
                    if (c.advanced) {
                        cc.optional = (cc.optional || []).concat(c.advanced);
                    }
                    return cc;
                };

                var shimConstraints_ = function(constraints, func) {
                    constraints = JSON.parse(JSON.stringify(constraints));
                    if (constraints && constraints.audio) {
                        constraints.audio = constraintsToChrome_(constraints.audio);
                    }
                    if (constraints && typeof constraints.video === 'object') {
                        // Shim facingMode for mobile & surface pro.
                        var face = constraints.video.facingMode;
                        face = face && ((typeof face === 'object') ? face : {
                            ideal: face
                        });
                        var getSupportedFacingModeLies = browserDetails.version < 61;

                        if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                                face.ideal === 'user' || face.ideal === 'environment')) &&
                            !(navigator.mediaDevices.getSupportedConstraints &&
                                navigator.mediaDevices.getSupportedConstraints().facingMode &&
                                !getSupportedFacingModeLies)) {
                            delete constraints.video.facingMode;
                            var matches;
                            if (face.exact === 'environment' || face.ideal === 'environment') {
                                matches = ['back', 'rear'];
                            } else if (face.exact === 'user' || face.ideal === 'user') {
                                matches = ['front'];
                            }
                            if (matches) {
                                // Look for matches in label, or use last cam for back (typical).
                                return navigator.mediaDevices.enumerateDevices()
                                    .then(function(devices) {
                                        devices = devices.filter(function(d) {
                                            return d.kind === 'videoinput';
                                        });
                                        var dev = devices.find(function(d) {
                                            return matches.some(function(match) {
                                                return d.label.toLowerCase().indexOf(match) !== -1;
                                            });
                                        });
                                        if (!dev && devices.length && matches.indexOf('back') !== -1) {
                                            dev = devices[devices.length - 1]; // more likely the back cam
                                        }
                                        if (dev) {
                                            constraints.video.deviceId = face.exact ? {
                                                exact: dev.deviceId
                                            } : {
                                                ideal: dev.deviceId
                                            };
                                        }
                                        constraints.video = constraintsToChrome_(constraints.video);
                                        logging('chrome: ' + JSON.stringify(constraints));
                                        return func(constraints);
                                    });
                            }
                        }
                        constraints.video = constraintsToChrome_(constraints.video);
                    }
                    logging('chrome: ' + JSON.stringify(constraints));
                    return func(constraints);
                };

                var shimError_ = function(e) {
                    return {
                        name: {
                            PermissionDeniedError: 'NotAllowedError',
                            ConstraintNotSatisfiedError: 'OverconstrainedError'
                        }[e.name] || e.name,
                        message: e.message,
                        constraint: e.constraintName,
                        toString: function() {
                            return this.name + (this.message && ': ') + this.message;
                        }
                    };
                };

                var getUserMedia_ = function(constraints, onSuccess, onError) {
                    shimConstraints_(constraints, function(c) {
                        navigator.webkitGetUserMedia(c, onSuccess, function(e) {
                            onError(shimError_(e));
                        });
                    });
                };

                navigator.getUserMedia = getUserMedia_;

                // Returns the result of getUserMedia as a Promise.
                var getUserMediaPromise_ = function(constraints) {
                    return new Promise(function(resolve, reject) {
                        navigator.getUserMedia(constraints, resolve, reject);
                    });
                };

                if (!navigator.mediaDevices) {
                    navigator.mediaDevices = {
                        getUserMedia: getUserMediaPromise_,
                        enumerateDevices: function() {
                            return new Promise(function(resolve) {
                                var kinds = {
                                    audio: 'audioinput',
                                    video: 'videoinput'
                                };
                                return MediaStreamTrack.getSources(function(devices) {
                                    resolve(devices.map(function(device) {
                                        return {
                                            label: device.label,
                                            kind: kinds[device.kind],
                                            deviceId: device.id,
                                            groupId: ''
                                        };
                                    }));
                                });
                            });
                        },
                        getSupportedConstraints: function() {
                            return {
                                deviceId: true,
                                echoCancellation: true,
                                facingMode: true,
                                frameRate: true,
                                height: true,
                                width: true
                            };
                        }
                    };
                }

                // A shim for getUserMedia method on the mediaDevices object.
                // TODO(KaptenJansson) remove once implemented in Chrome stable.
                if (!navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia = function(constraints) {
                        return getUserMediaPromise_(constraints);
                    };
                } else {
                    // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
                    // function which returns a Promise, it does not accept spec-style
                    // constraints.
                    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
                    bind(navigator.mediaDevices);
                    navigator.mediaDevices.getUserMedia = function(cs) {
                        return shimConstraints_(cs, function(c) {
                            return origGetUserMedia(c).then(function(stream) {
                                if (c.audio && !stream.getAudioTracks().length ||
                                    c.video && !stream.getVideoTracks().length) {
                                    stream.getTracks().forEach(function(track) {
                                        track.stop();
                                    });
                                    throw new DOMException('', 'NotFoundError');
                                }
                                return stream;
                            }, function(e) {
                                return Promise.reject(shimError_(e));
                            });
                        });
                    };
                }

                // Dummy devicechange event methods.
                // TODO(KaptenJansson) remove once implemented in Chrome stable.
                if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
                    navigator.mediaDevices.addEventListener = function() {
                        logging('Dummy mediaDevices.addEventListener called.');
                    };
                }
                if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
                    navigator.mediaDevices.removeEventListener = function() {
                        logging('Dummy mediaDevices.removeEventListener called.');
                    };
                }
            };

        }, {
            "../utils.js": 11
        }],
        5: [function(require, module, exports) {
            /*
             *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
             *
             *  Use of this source code is governed by a BSD-style license
             *  that can be found in the LICENSE file in the root of the source
             *  tree.
             */
            /* eslint-env node */
            'use strict';

            var browserDetails = require('../utils').browserDetails;
            var shimRTCPeerConnection = require('./rtcpeerconnection_shim');

            module.exports = {
                shimGetUserMedia: require('./getusermedia'),
                shimPeerConnection: function() {
                    if (window.RTCIceGatherer) {
                        // ORTC defines an RTCIceCandidate object but no constructor.
                        // Not implemented in Edge.
                        if (!window.RTCIceCandidate) {
                            window.RTCIceCandidate = function(args) {
                                return args;
                            };
                        }
                        // ORTC does not have a session description object but
                        // other browsers (i.e. Chrome) that will support both PC and ORTC
                        // in the future might have this defined already.
                        if (!window.RTCSessionDescription) {
                            window.RTCSessionDescription = function(args) {
                                return args;
                            };
                        }
                        // this adds an additional event listener to MediaStrackTrack that signals
                        // when a tracks enabled property was changed. Workaround for a bug in
                        // addStream, see below. No longer required in 15025+
                        if (browserDetails.version < 15025) {
                            var origMSTEnabled = Object.getOwnPropertyDescriptor(
                                MediaStreamTrack.prototype, 'enabled');
                            Object.defineProperty(MediaStreamTrack.prototype, 'enabled', {
                                set: function(value) {
                                    origMSTEnabled.set.call(this, value);
                                    var ev = new Event('enabled');
                                    ev.enabled = value;
                                    this.dispatchEvent(ev);
                                }
                            });
                        }
                    }
                    window.RTCPeerConnection = shimRTCPeerConnection(browserDetails.version);
                },
                shimReplaceTrack: function() {
                    // ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
                    if (window.RTCRtpSender && !('replaceTrack' in RTCRtpSender.prototype)) {
                        RTCRtpSender.prototype.replaceTrack = RTCRtpSender.prototype.setTrack;
                    }
                }
            };

        }, {
            "../utils": 11,
            "./getusermedia": 6,
            "./rtcpeerconnection_shim": 7
        }],
        6: [function(require, module, exports) {
            /*
             *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
             *
             *  Use of this source code is governed by a BSD-style license
             *  that can be found in the LICENSE file in the root of the source
             *  tree.
             */
            /* eslint-env node */
            'use strict';

            // Expose public methods.
            module.exports = function() {
                var shimError_ = function(e) {
                    return {
                        name: {
                            PermissionDeniedError: 'NotAllowedError'
                        }[e.name] || e.name,
                        message: e.message,
                        constraint: e.constraint,
                        toString: function() {
                            return this.name;
                        }
                    };
                };

                // getUserMedia error shim.
                var origGetUserMedia = navigator.mediaDevices.getUserMedia.
                bind(navigator.mediaDevices);
                navigator.mediaDevices.getUserMedia = function(c) {
                    return origGetUserMedia(c).catch(function(e) {
                        return Promise.reject(shimError_(e));
                    });
                };
            };

        }, {}],
        7: [function(require, module, exports) {
            /*
             *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
             *
             *  Use of this source code is governed by a BSD-style license
             *  that can be found in the LICENSE file in the root of the source
             *  tree.
             */
            /* eslint-env node */
            'use strict';

            var SDPUtils = require('sdp');

            // sort tracks such that they follow an a-v-a-v...
            // pattern.
            function sortTracks(tracks) {
                var audioTracks = tracks.filter(function(track) {
                    return track.kind === 'audio';
                });
                var videoTracks = tracks.filter(function(track) {
                    return track.kind === 'video';
                });
                tracks = [];
                while (audioTracks.length || videoTracks.length) {
                    if (audioTracks.length) {
                        tracks.push(audioTracks.shift());
                    }
                    if (videoTracks.length) {
                        tracks.push(videoTracks.shift());
                    }
                }
                return tracks;
            }

            // Edge does not like
            // 1) stun:
            // 2) turn: that does not have all of turn:host:port?transport=udp
            // 3) turn: with ipv6 addresses
            // 4) turn: occurring muliple times
            function filterIceServers(iceServers, edgeVersion) {
                var hasTurn = false;
                iceServers = JSON.parse(JSON.stringify(iceServers));
                return iceServers.filter(function(server) {
                    if (server && (server.urls || server.url)) {
                        var urls = server.urls || server.url;
                        if (server.url && !server.urls) {
                            console.warn('RTCIceServer.url is deprecated! Use urls instead.');
                        }
                        var isString = typeof urls === 'string';
                        if (isString) {
                            urls = [urls];
                        }
                        urls = urls.filter(function(url) {
                            var validTurn = url.indexOf('turn:') === 0 &&
                                url.indexOf('transport=udp') !== -1 &&
                                url.indexOf('turn:[') === -1 &&
                                !hasTurn;

                            if (validTurn) {
                                hasTurn = true;
                                return true;
                            }
                            return url.indexOf('stun:') === 0 && edgeVersion >= 14393;
                        });

                        delete server.url;
                        server.urls = isString ? urls[0] : urls;
                        return !!urls.length;
                    }
                    return false;
                });
            }

            module.exports = function(edgeVersion) {
                var RTCPeerConnection = function(config) {
                    var self = this;

                    var _eventTarget = document.createDocumentFragment();
                    ['addEventListener', 'removeEventListener', 'dispatchEvent']
                    .forEach(function(method) {
                        self[method] = _eventTarget[method].bind(_eventTarget);
                    });

                    this.onicecandidate = null;
                    this.onaddstream = null;
                    this.ontrack = null;
                    this.onremovestream = null;
                    this.onsignalingstatechange = null;
                    this.oniceconnectionstatechange = null;
                    this.onicegatheringstatechange = null;
                    this.onnegotiationneeded = null;
                    this.ondatachannel = null;
                    this.canTrickleIceCandidates = null;

                    this.localStreams = [];
                    this.remoteStreams = [];
                    this.getLocalStreams = function() {
                        return self.localStreams;
                    };
                    this.getRemoteStreams = function() {
                        return self.remoteStreams;
                    };

                    this.localDescription = new RTCSessionDescription({
                        type: '',
                        sdp: ''
                    });
                    this.remoteDescription = new RTCSessionDescription({
                        type: '',
                        sdp: ''
                    });
                    this.signalingState = 'stable';
                    this.iceConnectionState = 'new';
                    this.iceGatheringState = 'new';

                    this.iceOptions = {
                        gatherPolicy: 'all',
                        iceServers: []
                    };
                    if (config && config.iceTransportPolicy) {
                        switch (config.iceTransportPolicy) {
                            case 'all':
                            case 'relay':
                                this.iceOptions.gatherPolicy = config.iceTransportPolicy;
                                break;
                            default:
                                // don't set iceTransportPolicy.
                                break;
                        }
                    }
                    this.usingBundle = config && config.bundlePolicy === 'max-bundle';

                    if (config && config.iceServers) {
                        this.iceOptions.iceServers = filterIceServers(config.iceServers,
                            edgeVersion);
                    }
                    this._config = config || {};

                    // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
                    // everything that is needed to describe a SDP m-line.
                    this.transceivers = [];

                    // since the iceGatherer is currently created in createOffer but we
                    // must not emit candidates until after setLocalDescription we buffer
                    // them in this array.
                    this._localIceCandidatesBuffer = [];
                };

                RTCPeerConnection.prototype._emitGatheringStateChange = function() {
                    var event = new Event('icegatheringstatechange');
                    this.dispatchEvent(event);
                    if (this.onicegatheringstatechange !== null) {
                        this.onicegatheringstatechange(event);
                    }
                };

                RTCPeerConnection.prototype._emitBufferedCandidates = function() {
                    var self = this;
                    var sections = SDPUtils.splitSections(self.localDescription.sdp);
                    // FIXME: need to apply ice candidates in a way which is async but
                    // in-order
                    this._localIceCandidatesBuffer.forEach(function(event) {
                        var end = !event.candidate || Object.keys(event.candidate).length === 0;
                        if (end) {
                            for (var j = 1; j < sections.length; j++) {
                                if (sections[j].indexOf('\r\na=end-of-candidates\r\n') === -1) {
                                    sections[j] += 'a=end-of-candidates\r\n';
                                }
                            }
                        } else {
                            sections[event.candidate.sdpMLineIndex + 1] +=
                                'a=' + event.candidate.candidate + '\r\n';
                        }
                        self.localDescription.sdp = sections.join('');
                        self.dispatchEvent(event);
                        if (self.onicecandidate !== null) {
                            self.onicecandidate(event);
                        }
                        if (!event.candidate && self.iceGatheringState !== 'complete') {
                            var complete = self.transceivers.every(function(transceiver) {
                                return transceiver.iceGatherer &&
                                    transceiver.iceGatherer.state === 'completed';
                            });
                            if (complete && self.iceGatheringStateChange !== 'complete') {
                                self.iceGatheringState = 'complete';
                                self._emitGatheringStateChange();
                            }
                        }
                    });
                    this._localIceCandidatesBuffer = [];
                };

                RTCPeerConnection.prototype.getConfiguration = function() {
                    return this._config;
                };

                RTCPeerConnection.prototype.addStream = function(stream) {
                    if (edgeVersion >= 15025) {
                        this.localStreams.push(stream);
                    } else {
                        // Clone is necessary for local demos mostly, attaching directly
                        // to two different senders does not work (build 10547).
                        // Fixed in 15025 (or earlier)
                        var clonedStream = stream.clone();
                        stream.getTracks().forEach(function(track, idx) {
                            var clonedTrack = clonedStream.getTracks()[idx];
                            track.addEventListener('enabled', function(event) {
                                clonedTrack.enabled = event.enabled;
                            });
                        });
                        this.localStreams.push(clonedStream);
                    }
                    this._maybeFireNegotiationNeeded();
                };

                RTCPeerConnection.prototype.removeStream = function(stream) {
                    var idx = this.localStreams.indexOf(stream);
                    if (idx > -1) {
                        this.localStreams.splice(idx, 1);
                        this._maybeFireNegotiationNeeded();
                    }
                };

                RTCPeerConnection.prototype.getSenders = function() {
                    return this.transceivers.filter(function(transceiver) {
                            return !!transceiver.rtpSender;
                        })
                        .map(function(transceiver) {
                            return transceiver.rtpSender;
                        });
                };

                RTCPeerConnection.prototype.getReceivers = function() {
                    return this.transceivers.filter(function(transceiver) {
                            return !!transceiver.rtpReceiver;
                        })
                        .map(function(transceiver) {
                            return transceiver.rtpReceiver;
                        });
                };

                // Determines the intersection of local and remote capabilities.
                RTCPeerConnection.prototype._getCommonCapabilities = function(
                    localCapabilities, remoteCapabilities) {
                    var commonCapabilities = {
                        codecs: [],
                        headerExtensions: [],
                        fecMechanisms: []
                    };

                    var findCodecByPayloadType = function(pt, codecs) {
                        pt = parseInt(pt, 10);
                        for (var i = 0; i < codecs.length; i++) {
                            if (codecs[i].payloadType === pt ||
                                codecs[i].preferredPayloadType === pt) {
                                return codecs[i];
                            }
                        }
                    };

                    var rtxCapabilityMatches = function(lRtx, rRtx, lCodecs, rCodecs) {
                        var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
                        var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
                        return lCodec && rCodec &&
                            lCodec.name.toLowerCase() === rCodec.name.toLowerCase();
                    };

                    localCapabilities.codecs.forEach(function(lCodec) {
                        for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
                            var rCodec = remoteCapabilities.codecs[i];
                            if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
                                lCodec.clockRate === rCodec.clockRate) {
                                if (lCodec.name.toLowerCase() === 'rtx' &&
                                    lCodec.parameters && rCodec.parameters.apt) {
                                    // for RTX we need to find the local rtx that has a apt
                                    // which points to the same local codec as the remote one.
                                    if (!rtxCapabilityMatches(lCodec, rCodec,
                                            localCapabilities.codecs, remoteCapabilities.codecs)) {
                                        continue;
                                    }
                                }
                                rCodec = JSON.parse(JSON.stringify(rCodec)); // deepcopy
                                // number of channels is the highest common number of channels
                                rCodec.numChannels = Math.min(lCodec.numChannels,
                                    rCodec.numChannels);
                                // push rCodec so we reply with offerer payload type
                                commonCapabilities.codecs.push(rCodec);

                                // determine common feedback mechanisms
                                rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
                                    for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
                                        if (lCodec.rtcpFeedback[j].type === fb.type &&
                                            lCodec.rtcpFeedback[j].parameter === fb.parameter) {
                                            return true;
                                        }
                                    }
                                    return false;
                                });
                                // FIXME: also need to determine .parameters
                                //  see https://github.com/openpeer/ortc/issues/569
                                break;
                            }
                        }
                    });

                    localCapabilities.headerExtensions
                        .forEach(function(lHeaderExtension) {
                            for (var i = 0; i < remoteCapabilities.headerExtensions.length; i++) {
                                var rHeaderExtension = remoteCapabilities.headerExtensions[i];
                                if (lHeaderExtension.uri === rHeaderExtension.uri) {
                                    commonCapabilities.headerExtensions.push(rHeaderExtension);
                                    break;
                                }
                            }
                        });

                    // FIXME: fecMechanisms
                    return commonCapabilities;
                };

                // Create ICE gatherer, ICE transport and DTLS transport.
                RTCPeerConnection.prototype._createIceAndDtlsTransports = function(mid,
                    sdpMLineIndex) {
                    var self = this;
                    var iceGatherer = new RTCIceGatherer(self.iceOptions);
                    var iceTransport = new RTCIceTransport(iceGatherer);
                    iceGatherer.onlocalcandidate = function(evt) {
                        var event = new Event('icecandidate');
                        event.candidate = {
                            sdpMid: mid,
                            sdpMLineIndex: sdpMLineIndex
                        };

                        var cand = evt.candidate;
                        var end = !cand || Object.keys(cand).length === 0;
                        // Edge emits an empty object for RTCIceCandidateComplete‥
                        if (end) {
                            // polyfill since RTCIceGatherer.state is not implemented in
                            // Edge 10547 yet.
                            if (iceGatherer.state === undefined) {
                                iceGatherer.state = 'completed';
                            }
                        } else {
                            // RTCIceCandidate doesn't have a component, needs to be added
                            cand.component = iceTransport.component === 'RTCP' ? 2 : 1;
                            event.candidate.candidate = SDPUtils.writeCandidate(cand);
                        }

                        // update local description.
                        var sections = SDPUtils.splitSections(self.localDescription.sdp);
                        if (!end) {
                            sections[event.candidate.sdpMLineIndex + 1] +=
                                'a=' + event.candidate.candidate + '\r\n';
                        } else {
                            sections[event.candidate.sdpMLineIndex + 1] +=
                                'a=end-of-candidates\r\n';
                        }
                        self.localDescription.sdp = sections.join('');
                        var transceivers = self._pendingOffer ? self._pendingOffer :
                            self.transceivers;
                        var complete = transceivers.every(function(transceiver) {
                            return transceiver.iceGatherer &&
                                transceiver.iceGatherer.state === 'completed';
                        });

                        // Emit candidate if localDescription is set.
                        // Also emits null candidate when all gatherers are complete.
                        switch (self.iceGatheringState) {
                            case 'new':
                                if (!end) {
                                    self._localIceCandidatesBuffer.push(event);
                                }
                                if (end && complete) {
                                    self._localIceCandidatesBuffer.push(
                                        new Event('icecandidate'));
                                }
                                break;
                            case 'gathering':
                                self._emitBufferedCandidates();
                                if (!end) {
                                    self.dispatchEvent(event);
                                    if (self.onicecandidate !== null) {
                                        self.onicecandidate(event);
                                    }
                                }
                                if (complete) {
                                    self.dispatchEvent(new Event('icecandidate'));
                                    if (self.onicecandidate !== null) {
                                        self.onicecandidate(new Event('icecandidate'));
                                    }
                                    self.iceGatheringState = 'complete';
                                    self._emitGatheringStateChange();
                                }
                                break;
                            case 'complete':
                                // should not happen... currently!
                                break;
                            default: // no-op.
                                break;
                        }
                    };
                    iceTransport.onicestatechange = function() {
                        self._updateConnectionState();
                    };

                    var dtlsTransport = new RTCDtlsTransport(iceTransport);
                    dtlsTransport.ondtlsstatechange = function() {
                        self._updateConnectionState();
                    };
                    dtlsTransport.onerror = function() {
                        // onerror does not set state to failed by itself.
                        dtlsTransport.state = 'failed';
                        self._updateConnectionState();
                    };

                    return {
                        iceGatherer: iceGatherer,
                        iceTransport: iceTransport,
                        dtlsTransport: dtlsTransport
                    };
                };

                // Destroy ICE gatherer, ICE transport and DTLS transport.
                // Without triggering the callbacks.
                RTCPeerConnection.prototype._disposeIceAndDtlsTransports = function(
                    sdpMLineIndex) {
                    var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
                    if (iceGatherer) {
                        delete iceGatherer.onlocalcandidate;
                        delete this.transceivers[sdpMLineIndex].iceGatherer;
                    }
                    var iceTransport = this.transceivers[sdpMLineIndex].iceTransport;
                    if (iceTransport) {
                        delete iceTransport.onicestatechange;
                        delete this.transceivers[sdpMLineIndex].iceTransport;
                    }
                    var dtlsTransport = this.transceivers[sdpMLineIndex].dtlsTransport;
                    if (dtlsTransport) {
                        delete dtlsTransport.ondtlssttatechange;
                        delete dtlsTransport.onerror;
                        delete this.transceivers[sdpMLineIndex].dtlsTransport;
                    }
                };

                // Start the RTP Sender and Receiver for a transceiver.
                RTCPeerConnection.prototype._transceive = function(transceiver,
                    send, recv) {
                    var params = this._getCommonCapabilities(transceiver.localCapabilities,
                        transceiver.remoteCapabilities);
                    if (send && transceiver.rtpSender) {
                        params.encodings = transceiver.sendEncodingParameters;
                        params.rtcp = {
                            cname: SDPUtils.localCName,
                            compound: transceiver.rtcpParameters.compound
                        };
                        if (transceiver.recvEncodingParameters.length) {
                            params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
                        }
                        transceiver.rtpSender.send(params);
                    }
                    if (recv && transceiver.rtpReceiver) {
                        // remove RTX field in Edge 14942
                        if (transceiver.kind === 'video' &&
                            transceiver.recvEncodingParameters &&
                            edgeVersion < 15019) {
                            transceiver.recvEncodingParameters.forEach(function(p) {
                                delete p.rtx;
                            });
                        }
                        params.encodings = transceiver.recvEncodingParameters;
                        params.rtcp = {
                            cname: transceiver.rtcpParameters.cname,
                            compound: transceiver.rtcpParameters.compound
                        };
                        if (transceiver.sendEncodingParameters.length) {
                            params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
                        }
                        transceiver.rtpReceiver.receive(params);
                    }
                };

                RTCPeerConnection.prototype.setLocalDescription = function(description) {
                    var self = this;
                    var sections;
                    var sessionpart;
                    if (description.type === 'offer') {
                        // FIXME: What was the purpose of this empty if statement?
                        // if (!this._pendingOffer) {
                        // } else {
                        if (this._pendingOffer) {
                            // VERY limited support for SDP munging. Limited to:
                            // * changing the order of codecs
                            sections = SDPUtils.splitSections(description.sdp);
                            sessionpart = sections.shift();
                            sections.forEach(function(mediaSection, sdpMLineIndex) {
                                var caps = SDPUtils.parseRtpParameters(mediaSection);
                                self._pendingOffer[sdpMLineIndex].localCapabilities = caps;
                            });
                            this.transceivers = this._pendingOffer;
                            delete this._pendingOffer;
                        }
                    } else if (description.type === 'answer') {
                        sections = SDPUtils.splitSections(self.remoteDescription.sdp);
                        sessionpart = sections.shift();
                        var isIceLite = SDPUtils.matchPrefix(sessionpart,
                            'a=ice-lite').length > 0;
                        sections.forEach(function(mediaSection, sdpMLineIndex) {
                            var transceiver = self.transceivers[sdpMLineIndex];
                            var iceGatherer = transceiver.iceGatherer;
                            var iceTransport = transceiver.iceTransport;
                            var dtlsTransport = transceiver.dtlsTransport;
                            var localCapabilities = transceiver.localCapabilities;
                            var remoteCapabilities = transceiver.remoteCapabilities;

                            var rejected = SDPUtils.isRejected(mediaSection);

                            if (!rejected && !transceiver.isDatachannel) {
                                var remoteIceParameters = SDPUtils.getIceParameters(
                                    mediaSection, sessionpart);
                                var remoteDtlsParameters = SDPUtils.getDtlsParameters(
                                    mediaSection, sessionpart);
                                if (isIceLite) {
                                    remoteDtlsParameters.role = 'server';
                                }

                                if (!self.usingBundle || sdpMLineIndex === 0) {
                                    iceTransport.start(iceGatherer, remoteIceParameters,
                                        isIceLite ? 'controlling' : 'controlled');
                                    dtlsTransport.start(remoteDtlsParameters);
                                }

                                // Calculate intersection of capabilities.
                                var params = self._getCommonCapabilities(localCapabilities,
                                    remoteCapabilities);

                                // Start the RTCRtpSender. The RTCRtpReceiver for this
                                // transceiver has already been started in setRemoteDescription.
                                self._transceive(transceiver,
                                    params.codecs.length > 0,
                                    false);
                            }
                        });
                    }

                    this.localDescription = {
                        type: description.type,
                        sdp: description.sdp
                    };
                    switch (description.type) {
                        case 'offer':
                            this._updateSignalingState('have-local-offer');
                            break;
                        case 'answer':
                            this._updateSignalingState('stable');
                            break;
                        default:
                            throw new TypeError('unsupported type "' + description.type +
                                '"');
                    }

                    // If a success callback was provided, emit ICE candidates after it
                    // has been executed. Otherwise, emit callback after the Promise is
                    // resolved.
                    var hasCallback = arguments.length > 1 &&
                        typeof arguments[1] === 'function';
                    if (hasCallback) {
                        var cb = arguments[1];
                        window.setTimeout(function() {
                            cb();
                            if (self.iceGatheringState === 'new') {
                                self.iceGatheringState = 'gathering';
                                self._emitGatheringStateChange();
                            }
                            self._emitBufferedCandidates();
                        }, 0);
                    }
                    var p = Promise.resolve();
                    p.then(function() {
                        if (!hasCallback) {
                            if (self.iceGatheringState === 'new') {
                                self.iceGatheringState = 'gathering';
                                self._emitGatheringStateChange();
                            }
                            // Usually candidates will be emitted earlier.
                            window.setTimeout(self._emitBufferedCandidates.bind(self), 500);
                        }
                    });
                    return p;
                };

                RTCPeerConnection.prototype.setRemoteDescription = function(description) {
                    var self = this;
                    var streams = {};
                    var receiverList = [];
                    var sections = SDPUtils.splitSections(description.sdp);
                    var sessionpart = sections.shift();
                    var isIceLite = SDPUtils.matchPrefix(sessionpart,
                        'a=ice-lite').length > 0;
                    var usingBundle = SDPUtils.matchPrefix(sessionpart,
                        'a=group:BUNDLE ').length > 0;
                    var iceOptions = SDPUtils.matchPrefix(sessionpart,
                        'a=ice-options:')[0];
                    if (iceOptions) {
                        this.canTrickleIceCandidates = iceOptions.substr(14).split(' ')
                            .indexOf('trickle') >= 0;
                    } else {
                        this.canTrickleIceCandidates = false;
                    }

                    sections.forEach(function(mediaSection, sdpMLineIndex) {
                        var lines = SDPUtils.splitLines(mediaSection);
                        var kind = SDPUtils.getKind(mediaSection);
                        var rejected = SDPUtils.isRejected(mediaSection);
                        var protocol = lines[0].substr(2).split(' ')[2];

                        var direction = SDPUtils.getDirection(mediaSection, sessionpart);
                        var remoteMsid = SDPUtils.parseMsid(mediaSection);

                        var mid = SDPUtils.getMid(mediaSection) || SDPUtils.generateIdentifier();

                        // Reject datachannels which are not implemented yet.
                        if (kind === 'application' && protocol === 'DTLS/SCTP') {
                            self.transceivers[sdpMLineIndex] = {
                                mid: mid,
                                isDatachannel: true
                            };
                            return;
                        }

                        var transceiver;
                        var iceGatherer;
                        var iceTransport;
                        var dtlsTransport;
                        var rtpSender;
                        var rtpReceiver;
                        var sendEncodingParameters;
                        var recvEncodingParameters;
                        var localCapabilities;

                        var track;
                        // FIXME: ensure the mediaSection has rtcp-mux set.
                        var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
                        var remoteIceParameters;
                        var remoteDtlsParameters;
                        if (!rejected) {
                            remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
                                sessionpart);
                            remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
                                sessionpart);
                            remoteDtlsParameters.role = 'client';
                        }
                        recvEncodingParameters =
                            SDPUtils.parseRtpEncodingParameters(mediaSection);

                        var rtcpParameters = SDPUtils.parseRtcpParameters(mediaSection);

                        var isComplete = SDPUtils.matchPrefix(mediaSection,
                            'a=end-of-candidates', sessionpart).length > 0;
                        var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
                            .map(function(cand) {
                                return SDPUtils.parseCandidate(cand);
                            })
                            .filter(function(cand) {
                                return cand.component === '1';
                            });
                        if (description.type === 'offer' && !rejected) {
                            var transports = usingBundle && sdpMLineIndex > 0 ? {
                                iceGatherer: self.transceivers[0].iceGatherer,
                                iceTransport: self.transceivers[0].iceTransport,
                                dtlsTransport: self.transceivers[0].dtlsTransport
                            } : self._createIceAndDtlsTransports(mid, sdpMLineIndex);

                            if (isComplete && (!usingBundle || sdpMLineIndex === 0)) {
                                transports.iceTransport.setRemoteCandidates(cands);
                            }

                            localCapabilities = RTCRtpReceiver.getCapabilities(kind);

                            // filter RTX until additional stuff needed for RTX is implemented
                            // in adapter.js
                            if (edgeVersion < 15019) {
                                localCapabilities.codecs = localCapabilities.codecs.filter(
                                    function(codec) {
                                        return codec.name !== 'rtx';
                                    });
                            }

                            sendEncodingParameters = [{
                                ssrc: (2 * sdpMLineIndex + 2) * 1001
                            }];

                            if (direction === 'sendrecv' || direction === 'sendonly') {
                                rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport,
                                    kind);

                                track = rtpReceiver.track;
                                // FIXME: does not work with Plan B.
                                if (remoteMsid) {
                                    if (!streams[remoteMsid.stream]) {
                                        streams[remoteMsid.stream] = new MediaStream();
                                        Object.defineProperty(streams[remoteMsid.stream], 'id', {
                                            get: function() {
                                                return remoteMsid.stream;
                                            }
                                        });
                                    }
                                    Object.defineProperty(track, 'id', {
                                        get: function() {
                                            return remoteMsid.track;
                                        }
                                    });
                                    streams[remoteMsid.stream].addTrack(track);
                                    receiverList.push([track, rtpReceiver,
                                        streams[remoteMsid.stream]
                                    ]);
                                } else {
                                    if (!streams.default) {
                                        streams.default = new MediaStream();
                                    }
                                    streams.default.addTrack(track);
                                    receiverList.push([track, rtpReceiver, streams.default]);
                                }
                            }

                            self.transceivers[sdpMLineIndex] = {
                                iceGatherer: transports.iceGatherer,
                                iceTransport: transports.iceTransport,
                                dtlsTransport: transports.dtlsTransport,
                                localCapabilities: localCapabilities,
                                remoteCapabilities: remoteCapabilities,
                                rtpSender: rtpSender,
                                rtpReceiver: rtpReceiver,
                                kind: kind,
                                mid: mid,
                                rtcpParameters: rtcpParameters,
                                sendEncodingParameters: sendEncodingParameters,
                                recvEncodingParameters: recvEncodingParameters
                            };
                            // Start the RTCRtpReceiver now. The RTPSender is started in
                            // setLocalDescription.
                            self._transceive(self.transceivers[sdpMLineIndex],
                                false,
                                direction === 'sendrecv' || direction === 'sendonly');
                        } else if (description.type === 'answer' && !rejected) {
                            if (usingBundle && sdpMLineIndex > 0) {
                                self._disposeIceAndDtlsTransports(sdpMLineIndex);
                                self.transceivers[sdpMLineIndex].iceGatherer =
                                    self.transceivers[0].iceGatherer;
                                self.transceivers[sdpMLineIndex].iceTransport =
                                    self.transceivers[0].iceTransport;
                                self.transceivers[sdpMLineIndex].dtlsTransport =
                                    self.transceivers[0].dtlsTransport;
                                if (self.transceivers[sdpMLineIndex].rtpSender) {
                                    self.transceivers[sdpMLineIndex].rtpSender.setTransport(
                                        self.transceivers[0].dtlsTransport);
                                }
                                if (self.transceivers[sdpMLineIndex].rtpReceiver) {
                                    self.transceivers[sdpMLineIndex].rtpReceiver.setTransport(
                                        self.transceivers[0].dtlsTransport);
                                }
                            }
                            transceiver = self.transceivers[sdpMLineIndex];
                            iceGatherer = transceiver.iceGatherer;
                            iceTransport = transceiver.iceTransport;
                            dtlsTransport = transceiver.dtlsTransport;
                            rtpSender = transceiver.rtpSender;
                            rtpReceiver = transceiver.rtpReceiver;
                            sendEncodingParameters = transceiver.sendEncodingParameters;
                            localCapabilities = transceiver.localCapabilities;

                            self.transceivers[sdpMLineIndex].recvEncodingParameters =
                                recvEncodingParameters;
                            self.transceivers[sdpMLineIndex].remoteCapabilities =
                                remoteCapabilities;
                            self.transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;

                            if ((isIceLite || isComplete) && cands.length) {
                                iceTransport.setRemoteCandidates(cands);
                            }
                            if (!usingBundle || sdpMLineIndex === 0) {
                                iceTransport.start(iceGatherer, remoteIceParameters,
                                    'controlling');
                                dtlsTransport.start(remoteDtlsParameters);
                            }

                            self._transceive(transceiver,
                                direction === 'sendrecv' || direction === 'recvonly',
                                direction === 'sendrecv' || direction === 'sendonly');

                            if (rtpReceiver &&
                                (direction === 'sendrecv' || direction === 'sendonly')) {
                                track = rtpReceiver.track;
                                if (remoteMsid) {
                                    if (!streams[remoteMsid.stream]) {
                                        streams[remoteMsid.stream] = new MediaStream();
                                    }
                                    streams[remoteMsid.stream].addTrack(track);
                                    receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
                                } else {
                                    if (!streams.default) {
                                        streams.default = new MediaStream();
                                    }
                                    streams.default.addTrack(track);
                                    receiverList.push([track, rtpReceiver, streams.default]);
                                }
                            } else {
                                // FIXME: actually the receiver should be created later.
                                delete transceiver.rtpReceiver;
                            }
                        }
                    });
                    this.usingBundle = usingBundle;

                    this.remoteDescription = {
                        type: description.type,
                        sdp: description.sdp
                    };
                    switch (description.type) {
                        case 'offer':
                            this._updateSignalingState('have-remote-offer');
                            break;
                        case 'answer':
                            this._updateSignalingState('stable');
                            break;
                        default:
                            throw new TypeError('unsupported type "' + description.type +
                                '"');
                    }
                    Object.keys(streams).forEach(function(sid) {
                        var stream = streams[sid];
                        if (stream.getTracks().length) {
                            self.remoteStreams.push(stream);
                            var event = new Event('addstream');
                            event.stream = stream;
                            self.dispatchEvent(event);
                            if (self.onaddstream !== null) {
                                window.setTimeout(function() {
                                    self.onaddstream(event);
                                }, 0);
                            }

                            receiverList.forEach(function(item) {
                                var track = item[0];
                                var receiver = item[1];
                                if (stream.id !== item[2].id) {
                                    return;
                                }
                                var trackEvent = new Event('track');
                                trackEvent.track = track;
                                trackEvent.receiver = receiver;
                                trackEvent.streams = [stream];
                                self.dispatchEvent(trackEvent);
                                if (self.ontrack !== null) {
                                    window.setTimeout(function() {
                                        self.ontrack(trackEvent);
                                    }, 0);
                                }
                            });
                        }
                    });
                    if (arguments.length > 1 && typeof arguments[1] === 'function') {
                        window.setTimeout(arguments[1], 0);
                    }
                    return Promise.resolve();
                };

                RTCPeerConnection.prototype.close = function() {
                    this.transceivers.forEach(function(transceiver) {
                        /* not yet
                        if (transceiver.iceGatherer) {
                          transceiver.iceGatherer.close();
                        }
                        */
                        if (transceiver.iceTransport) {
                            transceiver.iceTransport.stop();
                        }
                        if (transceiver.dtlsTransport) {
                            transceiver.dtlsTransport.stop();
                        }
                        if (transceiver.rtpSender) {
                            transceiver.rtpSender.stop();
                        }
                        if (transceiver.rtpReceiver) {
                            transceiver.rtpReceiver.stop();
                        }
                    });
                    // FIXME: clean up tracks, local streams, remote streams, etc
                    this._updateSignalingState('closed');
                };

                // Update the signaling state.
                RTCPeerConnection.prototype._updateSignalingState = function(newState) {
                    this.signalingState = newState;
                    var event = new Event('signalingstatechange');
                    this.dispatchEvent(event);
                    if (this.onsignalingstatechange !== null) {
                        this.onsignalingstatechange(event);
                    }
                };

                // Determine whether to fire the negotiationneeded event.
                RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function() {
                    // Fire away (for now).
                    var event = new Event('negotiationneeded');
                    this.dispatchEvent(event);
                    if (this.onnegotiationneeded !== null) {
                        this.onnegotiationneeded(event);
                    }
                };

                // Update the connection state.
                RTCPeerConnection.prototype._updateConnectionState = function() {
                    var self = this;
                    var newState;
                    var states = {
                        'new': 0,
                        closed: 0,
                        connecting: 0,
                        checking: 0,
                        connected: 0,
                        completed: 0,
                        failed: 0
                    };
                    this.transceivers.forEach(function(transceiver) {
                        states[transceiver.iceTransport.state]++;
                        states[transceiver.dtlsTransport.state]++;
                    });
                    // ICETransport.completed and connected are the same for this purpose.
                    states.connected += states.completed;

                    newState = 'new';
                    if (states.failed > 0) {
                        newState = 'failed';
                    } else if (states.connecting > 0 || states.checking > 0) {
                        newState = 'connecting';
                    } else if (states.disconnected > 0) {
                        newState = 'disconnected';
                    } else if (states.new > 0) {
                        newState = 'new';
                    } else if (states.connected > 0 || states.completed > 0) {
                        newState = 'connected';
                    }

                    if (newState !== self.iceConnectionState) {
                        self.iceConnectionState = newState;
                        var event = new Event('iceconnectionstatechange');
                        this.dispatchEvent(event);
                        if (this.oniceconnectionstatechange !== null) {
                            this.oniceconnectionstatechange(event);
                        }
                    }
                };

                RTCPeerConnection.prototype.createOffer = function() {
                    var self = this;
                    if (this._pendingOffer) {
                        throw new Error('createOffer called while there is a pending offer.');
                    }
                    var offerOptions;
                    if (arguments.length === 1 && typeof arguments[0] !== 'function') {
                        offerOptions = arguments[0];
                    } else if (arguments.length === 3) {
                        offerOptions = arguments[2];
                    }

                    var tracks = [];
                    var numAudioTracks = 0;
                    var numVideoTracks = 0;
                    // Default to sendrecv.
                    if (this.localStreams.length) {
                        numAudioTracks = this.localStreams.reduce(function(numTracks, stream) {
                            return numTracks + stream.getAudioTracks().length;
                        }, 0);
                        numVideoTracks = this.localStreams.reduce(function(numTracks, stream) {
                            return numTracks + stream.getVideoTracks().length;
                        }, 0);
                    }
                    // Determine number of audio and video tracks we need to send/recv.
                    if (offerOptions) {
                        // Reject Chrome legacy constraints.
                        if (offerOptions.mandatory || offerOptions.optional) {
                            throw new TypeError(
                                'Legacy mandatory/optional constraints not supported.');
                        }
                        if (offerOptions.offerToReceiveAudio !== undefined) {
                            if (offerOptions.offerToReceiveAudio === true) {
                                numAudioTracks = 1;
                            } else if (offerOptions.offerToReceiveAudio === false) {
                                numAudioTracks = 0;
                            } else {
                                numAudioTracks = offerOptions.offerToReceiveAudio;
                            }
                        }
                        if (offerOptions.offerToReceiveVideo !== undefined) {
                            if (offerOptions.offerToReceiveVideo === true) {
                                numVideoTracks = 1;
                            } else if (offerOptions.offerToReceiveVideo === false) {
                                numVideoTracks = 0;
                            } else {
                                numVideoTracks = offerOptions.offerToReceiveVideo;
                            }
                        }
                    }

                    // Push local streams.
                    this.localStreams.forEach(function(localStream) {
                        localStream.getTracks().forEach(function(track) {
                            tracks.push({
                                kind: track.kind,
                                track: track,
                                stream: localStream,
                                wantReceive: track.kind === 'audio' ?
                                    numAudioTracks > 0 : numVideoTracks > 0
                            });
                            if (track.kind === 'audio') {
                                numAudioTracks--;
                            } else if (track.kind === 'video') {
                                numVideoTracks--;
                            }
                        });
                    });

                    // Create M-lines for recvonly streams.
                    while (numAudioTracks > 0 || numVideoTracks > 0) {
                        if (numAudioTracks > 0) {
                            tracks.push({
                                kind: 'audio',
                                wantReceive: true
                            });
                            numAudioTracks--;
                        }
                        if (numVideoTracks > 0) {
                            tracks.push({
                                kind: 'video',
                                wantReceive: true
                            });
                            numVideoTracks--;
                        }
                    }
                    // reorder tracks
                    tracks = sortTracks(tracks);

                    var sdp = SDPUtils.writeSessionBoilerplate();
                    var transceivers = [];
                    tracks.forEach(function(mline, sdpMLineIndex) {
                        // For each track, create an ice gatherer, ice transport,
                        // dtls transport, potentially rtpsender and rtpreceiver.
                        var track = mline.track;
                        var kind = mline.kind;
                        var mid = SDPUtils.generateIdentifier();

                        var transports = self.usingBundle && sdpMLineIndex > 0 ? {
                            iceGatherer: transceivers[0].iceGatherer,
                            iceTransport: transceivers[0].iceTransport,
                            dtlsTransport: transceivers[0].dtlsTransport
                        } : self._createIceAndDtlsTransports(mid, sdpMLineIndex);

                        var localCapabilities = RTCRtpSender.getCapabilities(kind);
                        // filter RTX until additional stuff needed for RTX is implemented
                        // in adapter.js
                        if (edgeVersion < 15019) {
                            localCapabilities.codecs = localCapabilities.codecs.filter(
                                function(codec) {
                                    return codec.name !== 'rtx';
                                });
                        }
                        localCapabilities.codecs.forEach(function(codec) {
                            // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
                            // by adding level-asymmetry-allowed=1
                            if (codec.name === 'H264' &&
                                codec.parameters['level-asymmetry-allowed'] === undefined) {
                                codec.parameters['level-asymmetry-allowed'] = '1';
                            }
                        });

                        var rtpSender;
                        var rtpReceiver;

                        // generate an ssrc now, to be used later in rtpSender.send
                        var sendEncodingParameters = [{
                            ssrc: (2 * sdpMLineIndex + 1) * 1001
                        }];
                        if (track) {
                            // add RTX
                            if (edgeVersion >= 15019 && kind === 'video') {
                                sendEncodingParameters[0].rtx = {
                                    ssrc: (2 * sdpMLineIndex + 1) * 1001 + 1
                                };
                            }
                            rtpSender = new RTCRtpSender(track, transports.dtlsTransport);
                        }

                        if (mline.wantReceive) {
                            rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);
                        }

                        transceivers[sdpMLineIndex] = {
                            iceGatherer: transports.iceGatherer,
                            iceTransport: transports.iceTransport,
                            dtlsTransport: transports.dtlsTransport,
                            localCapabilities: localCapabilities,
                            remoteCapabilities: null,
                            rtpSender: rtpSender,
                            rtpReceiver: rtpReceiver,
                            kind: kind,
                            mid: mid,
                            sendEncodingParameters: sendEncodingParameters,
                            recvEncodingParameters: null
                        };
                    });

                    // always offer BUNDLE and dispose on return if not supported.
                    if (this._config.bundlePolicy !== 'max-compat') {
                        sdp += 'a=group:BUNDLE ' + transceivers.map(function(t) {
                            return t.mid;
                        }).join(' ') + '\r\n';
                    }
                    sdp += 'a=ice-options:trickle\r\n';

                    tracks.forEach(function(mline, sdpMLineIndex) {
                        var transceiver = transceivers[sdpMLineIndex];
                        sdp += SDPUtils.writeMediaSection(transceiver,
                            transceiver.localCapabilities, 'offer', mline.stream);
                        sdp += 'a=rtcp-rsize\r\n';
                    });

                    this._pendingOffer = transceivers;
                    var desc = new RTCSessionDescription({
                        type: 'offer',
                        sdp: sdp
                    });
                    if (arguments.length && typeof arguments[0] === 'function') {
                        window.setTimeout(arguments[0], 0, desc);
                    }
                    return Promise.resolve(desc);
                };

                RTCPeerConnection.prototype.createAnswer = function() {
                    var self = this;

                    var sdp = SDPUtils.writeSessionBoilerplate();
                    if (this.usingBundle) {
                        sdp += 'a=group:BUNDLE ' + this.transceivers.map(function(t) {
                            return t.mid;
                        }).join(' ') + '\r\n';
                    }
                    this.transceivers.forEach(function(transceiver, sdpMLineIndex) {
                        if (transceiver.isDatachannel) {
                            sdp += 'm=application 0 DTLS/SCTP 5000\r\n' +
                                'c=IN IP4 0.0.0.0\r\n' +
                                'a=mid:' + transceiver.mid + '\r\n';
                            return;
                        }

                        // FIXME: look at direction.
                        if (self.localStreams.length > 0 &&
                            self.localStreams[0].getTracks().length >= sdpMLineIndex) {
                            var localTrack;
                            if (transceiver.kind === 'audio') {
                                localTrack = self.localStreams[0].getAudioTracks()[0];
                            } else if (transceiver.kind === 'video') {
                                localTrack = self.localStreams[0].getVideoTracks()[0];
                            }
                            if (localTrack) {
                                // add RTX
                                if (edgeVersion >= 15019 && transceiver.kind === 'video') {
                                    transceiver.sendEncodingParameters[0].rtx = {
                                        ssrc: (2 * sdpMLineIndex + 2) * 1001 + 1
                                    };
                                }
                                transceiver.rtpSender = new RTCRtpSender(localTrack,
                                    transceiver.dtlsTransport);
                            }
                        }

                        // Calculate intersection of capabilities.
                        var commonCapabilities = self._getCommonCapabilities(
                            transceiver.localCapabilities,
                            transceiver.remoteCapabilities);

                        var hasRtx = commonCapabilities.codecs.filter(function(c) {
                            return c.name.toLowerCase() === 'rtx';
                        }).length;
                        if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
                            delete transceiver.sendEncodingParameters[0].rtx;
                        }

                        sdp += SDPUtils.writeMediaSection(transceiver, commonCapabilities,
                            'answer', self.localStreams[0]);
                        if (transceiver.rtcpParameters &&
                            transceiver.rtcpParameters.reducedSize) {
                            sdp += 'a=rtcp-rsize\r\n';
                        }
                    });

                    var desc = new RTCSessionDescription({
                        type: 'answer',
                        sdp: sdp
                    });
                    if (arguments.length && typeof arguments[0] === 'function') {
                        window.setTimeout(arguments[0], 0, desc);
                    }
                    return Promise.resolve(desc);
                };

                RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
                    if (!candidate) {
                        for (var j = 0; j < this.transceivers.length; j++) {
                            this.transceivers[j].iceTransport.addRemoteCandidate({});
                            if (this.usingBundle) {
                                return Promise.resolve();
                            }
                        }
                    } else {
                        var mLineIndex = candidate.sdpMLineIndex;
                        if (candidate.sdpMid) {
                            for (var i = 0; i < this.transceivers.length; i++) {
                                if (this.transceivers[i].mid === candidate.sdpMid) {
                                    mLineIndex = i;
                                    break;
                                }
                            }
                        }
                        var transceiver = this.transceivers[mLineIndex];
                        if (transceiver) {
                            var cand = Object.keys(candidate.candidate).length > 0 ?
                                SDPUtils.parseCandidate(candidate.candidate) : {};
                            // Ignore Chrome's invalid candidates since Edge does not like them.
                            if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
                                return Promise.resolve();
                            }
                            // Ignore RTCP candidates, we assume RTCP-MUX.
                            if (cand.component !== '1') {
                                return Promise.resolve();
                            }
                            transceiver.iceTransport.addRemoteCandidate(cand);

                            // update the remoteDescription.
                            var sections = SDPUtils.splitSections(this.remoteDescription.sdp);
                            sections[mLineIndex + 1] += (cand.type ? candidate.candidate.trim() :
                                'a=end-of-candidates') + '\r\n';
                            this.remoteDescription.sdp = sections.join('');
                        }
                    }
                    if (arguments.length > 1 && typeof arguments[1] === 'function') {
                        window.setTimeout(arguments[1], 0);
                    }
                    return Promise.resolve();
                };

                RTCPeerConnection.prototype.getStats = function() {
                    var promises = [];
                    this.transceivers.forEach(function(transceiver) {
                        ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
                            'dtlsTransport'
                        ].forEach(function(method) {
                            if (transceiver[method]) {
                                promises.push(transceiver[method].getStats());
                            }
                        });
                    });
                    var cb = arguments.length > 1 && typeof arguments[1] === 'function' &&
                        arguments[1];
                    var fixStatsType = function(stat) {
                        return {
                            inboundrtp: 'inbound-rtp',
                            outboundrtp: 'outbound-rtp',
                            candidatepair: 'candidate-pair',
                            localcandidate: 'local-candidate',
                            remotecandidate: 'remote-candidate'
                        }[stat.type] || stat.type;
                    };
                    return new Promise(function(resolve) {
                        // shim getStats with maplike support
                        var results = new Map();
                        Promise.all(promises).then(function(res) {
                            res.forEach(function(result) {
                                Object.keys(result).forEach(function(id) {
                                    result[id].type = fixStatsType(result[id]);
                                    results.set(id, result[id]);
                                });
                            });
                            if (cb) {
                                window.setTimeout(cb, 0, results);
                            }
                            resolve(results);
                        });
                    });
                };
                return RTCPeerConnection;
            };

        }, {
            "sdp": 1
        }],
        8: [function(require, module, exports) {
            /*
             *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
             *
             *  Use of this source code is governed by a BSD-style license
             *  that can be found in the LICENSE file in the root of the source
             *  tree.
             */
            /* eslint-env node */
            'use strict';

            var browserDetails = require('../utils').browserDetails;

            var firefoxShim = {
                shimOnTrack: function() {
                    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
                            window.RTCPeerConnection.prototype)) {
                        Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
                            get: function() {
                                return this._ontrack;
                            },
                            set: function(f) {
                                if (this._ontrack) {
                                    this.removeEventListener('track', this._ontrack);
                                    this.removeEventListener('addstream', this._ontrackpoly);
                                }
                                this.addEventListener('track', this._ontrack = f);
                                this.addEventListener('addstream', this._ontrackpoly = function(e) {
                                    e.stream.getTracks().forEach(function(track) {
                                        var event = new Event('track');
                                        event.track = track;
                                        event.receiver = {
                                            track: track
                                        };
                                        event.streams = [e.stream];
                                        this.dispatchEvent(event);
                                    }.bind(this));
                                }.bind(this));
                            }
                        });
                    }
                },

                shimSourceObject: function() {
                    // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
                    if (typeof window === 'object') {
                        if (window.HTMLMediaElement &&
                            !('srcObject' in window.HTMLMediaElement.prototype)) {
                            // Shim the srcObject property, once, when HTMLMediaElement is found.
                            Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
                                get: function() {
                                    return this.mozSrcObject;
                                },
                                set: function(stream) {
                                    this.mozSrcObject = stream;
                                }
                            });
                        }
                    }
                },

                shimPeerConnection: function() {
                    if (typeof window !== 'object' || !(window.RTCPeerConnection ||
                            window.mozRTCPeerConnection)) {
                        return; // probably media.peerconnection.enabled=false in about:config
                    }
                    // The RTCPeerConnection object.
                    if (!window.RTCPeerConnection) {
                        window.RTCPeerConnection = function(pcConfig, pcConstraints) {
                            if (browserDetails.version < 38) {
                                // .urls is not supported in FF < 38.
                                // create RTCIceServers with a single url.
                                if (pcConfig && pcConfig.iceServers) {
                                    var newIceServers = [];
                                    for (var i = 0; i < pcConfig.iceServers.length; i++) {
                                        var server = pcConfig.iceServers[i];
                                        if (server.hasOwnProperty('urls')) {
                                            for (var j = 0; j < server.urls.length; j++) {
                                                var newServer = {
                                                    url: server.urls[j]
                                                };
                                                if (server.urls[j].indexOf('turn') === 0) {
                                                    newServer.username = server.username;
                                                    newServer.credential = server.credential;
                                                }
                                                newIceServers.push(newServer);
                                            }
                                        } else {
                                            newIceServers.push(pcConfig.iceServers[i]);
                                        }
                                    }
                                    pcConfig.iceServers = newIceServers;
                                }
                            }
                            return new mozRTCPeerConnection(pcConfig, pcConstraints);
                        };
                        window.RTCPeerConnection.prototype = mozRTCPeerConnection.prototype;

                        // wrap static methods. Currently just generateCertificate.
                        if (mozRTCPeerConnection.generateCertificate) {
                            Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
                                get: function() {
                                    return mozRTCPeerConnection.generateCertificate;
                                }
                            });
                        }

                        window.RTCSessionDescription = mozRTCSessionDescription;
                        window.RTCIceCandidate = mozRTCIceCandidate;
                    }

                    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
                    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
                    .forEach(function(method) {
                        var nativeMethod = RTCPeerConnection.prototype[method];
                        RTCPeerConnection.prototype[method] = function() {
                            arguments[0] = new((method === 'addIceCandidate') ?
                                RTCIceCandidate : RTCSessionDescription)(arguments[0]);
                            return nativeMethod.apply(this, arguments);
                        };
                    });

                    // support for addIceCandidate(null or undefined)
                    var nativeAddIceCandidate =
                        RTCPeerConnection.prototype.addIceCandidate;
                    RTCPeerConnection.prototype.addIceCandidate = function() {
                        if (!arguments[0]) {
                            if (arguments[1]) {
                                arguments[1].apply(null);
                            }
                            return Promise.resolve();
                        }
                        return nativeAddIceCandidate.apply(this, arguments);
                    };

                    // shim getStats with maplike support
                    var makeMapStats = function(stats) {
                        var map = new Map();
                        Object.keys(stats).forEach(function(key) {
                            map.set(key, stats[key]);
                            map[key] = stats[key];
                        });
                        return map;
                    };

                    var modernStatsTypes = {
                        inboundrtp: 'inbound-rtp',
                        outboundrtp: 'outbound-rtp',
                        candidatepair: 'candidate-pair',
                        localcandidate: 'local-candidate',
                        remotecandidate: 'remote-candidate'
                    };

                    var nativeGetStats = RTCPeerConnection.prototype.getStats;
                    RTCPeerConnection.prototype.getStats = function(selector, onSucc, onErr) {
                        return nativeGetStats.apply(this, [selector || null])
                            .then(function(stats) {
                                if (browserDetails.version < 48) {
                                    stats = makeMapStats(stats);
                                }
                                if (browserDetails.version < 53 && !onSucc) {
                                    // Shim only promise getStats with spec-hyphens in type names
                                    // Leave callback version alone; misc old uses of forEach before Map
                                    try {
                                        stats.forEach(function(stat) {
                                            stat.type = modernStatsTypes[stat.type] || stat.type;
                                        });
                                    } catch (e) {
                                        if (e.name !== 'TypeError') {
                                            throw e;
                                        }
                                        // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
                                        stats.forEach(function(stat, i) {
                                            stats.set(i, Object.assign({}, stat, {
                                                type: modernStatsTypes[stat.type] || stat.type
                                            }));
                                        });
                                    }
                                }
                                return stats;
                            })
                            .then(onSucc, onErr);
                    };
                }
            };

            // Expose public methods.
            module.exports = {
                shimOnTrack: firefoxShim.shimOnTrack,
                shimSourceObject: firefoxShim.shimSourceObject,
                shimPeerConnection: firefoxShim.shimPeerConnection,
                shimGetUserMedia: require('./getusermedia')
            };

        }, {
            "../utils": 11,
            "./getusermedia": 9
        }],
        9: [function(require, module, exports) {
            /*
             *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
             *
             *  Use of this source code is governed by a BSD-style license
             *  that can be found in the LICENSE file in the root of the source
             *  tree.
             */
            /* eslint-env node */
            'use strict';

            var logging = require('../utils').log;
            var browserDetails = require('../utils').browserDetails;

            // Expose public methods.
            module.exports = function() {
                var shimError_ = function(e) {
                    return {
                        name: {
                            NotSupportedError: 'TypeError',
                            SecurityError: 'NotAllowedError',
                            PermissionDeniedError: 'NotAllowedError'
                        }[e.name] || e.name,
                        message: {
                            'The operation is insecure.': 'The request is not allowed by the ' +
                                'user agent or the platform in the current context.'
                        }[e.message] || e.message,
                        constraint: e.constraint,
                        toString: function() {
                            return this.name + (this.message && ': ') + this.message;
                        }
                    };
                };

                // getUserMedia constraints shim.
                var getUserMedia_ = function(constraints, onSuccess, onError) {
                    var constraintsToFF37_ = function(c) {
                        if (typeof c !== 'object' || c.require) {
                            return c;
                        }
                        var require = [];
                        Object.keys(c).forEach(function(key) {
                            if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
                                return;
                            }
                            var r = c[key] = (typeof c[key] === 'object') ?
                                c[key] : {
                                    ideal: c[key]
                                };
                            if (r.min !== undefined ||
                                r.max !== undefined || r.exact !== undefined) {
                                require.push(key);
                            }
                            if (r.exact !== undefined) {
                                if (typeof r.exact === 'number') {
                                    r.min = r.max = r.exact;
                                } else {
                                    c[key] = r.exact;
                                }
                                delete r.exact;
                            }
                            if (r.ideal !== undefined) {
                                c.advanced = c.advanced || [];
                                var oc = {};
                                if (typeof r.ideal === 'number') {
                                    oc[key] = {
                                        min: r.ideal,
                                        max: r.ideal
                                    };
                                } else {
                                    oc[key] = r.ideal;
                                }
                                c.advanced.push(oc);
                                delete r.ideal;
                                if (!Object.keys(r).length) {
                                    delete c[key];
                                }
                            }
                        });
                        if (require.length) {
                            c.require = require;
                        }
                        return c;
                    };
                    constraints = JSON.parse(JSON.stringify(constraints));
                    if (browserDetails.version < 38) {
                        logging('spec: ' + JSON.stringify(constraints));
                        if (constraints.audio) {
                            constraints.audio = constraintsToFF37_(constraints.audio);
                        }
                        if (constraints.video) {
                            constraints.video = constraintsToFF37_(constraints.video);
                        }
                        logging('ff37: ' + JSON.stringify(constraints));
                    }
                    return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
                        onError(shimError_(e));
                    });
                };

                // Returns the result of getUserMedia as a Promise.
                var getUserMediaPromise_ = function(constraints) {
                    return new Promise(function(resolve, reject) {
                        getUserMedia_(constraints, resolve, reject);
                    });
                };

                // Shim for mediaDevices on older versions.
                if (!navigator.mediaDevices) {
                    navigator.mediaDevices = {
                        getUserMedia: getUserMediaPromise_,
                        addEventListener: function() {},
                        removeEventListener: function() {}
                    };
                }
                navigator.mediaDevices.enumerateDevices =
                    navigator.mediaDevices.enumerateDevices || function() {
                        return new Promise(function(resolve) {
                            var infos = [{
                                    kind: 'audioinput',
                                    deviceId: 'default',
                                    label: '',
                                    groupId: ''
                                },
                                {
                                    kind: 'videoinput',
                                    deviceId: 'default',
                                    label: '',
                                    groupId: ''
                                }
                            ];
                            resolve(infos);
                        });
                    };

                if (browserDetails.version < 41) {
                    // Work around http://bugzil.la/1169665
                    var orgEnumerateDevices =
                        navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
                    navigator.mediaDevices.enumerateDevices = function() {
                        return orgEnumerateDevices().then(undefined, function(e) {
                            if (e.name === 'NotFoundError') {
                                return [];
                            }
                            throw e;
                        });
                    };
                }
                if (browserDetails.version < 49) {
                    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
                    bind(navigator.mediaDevices);
                    navigator.mediaDevices.getUserMedia = function(c) {
                        return origGetUserMedia(c).then(function(stream) {
                            // Work around https://bugzil.la/802326
                            if (c.audio && !stream.getAudioTracks().length ||
                                c.video && !stream.getVideoTracks().length) {
                                stream.getTracks().forEach(function(track) {
                                    track.stop();
                                });
                                throw new DOMException('The object can not be found here.',
                                    'NotFoundError');
                            }
                            return stream;
                        }, function(e) {
                            return Promise.reject(shimError_(e));
                        });
                    };
                }
                navigator.getUserMedia = function(constraints, onSuccess, onError) {
                    if (browserDetails.version < 44) {
                        return getUserMedia_(constraints, onSuccess, onError);
                    }
                    // Replace Firefox 44+'s deprecation warning with unprefixed version.
                    console.warn('navigator.getUserMedia has been replaced by ' +
                        'navigator.mediaDevices.getUserMedia');
                    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
                };
            };

        }, {
            "../utils": 11
        }],
        10: [function(require, module, exports) {
            /*
             *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
             *
             *  Use of this source code is governed by a BSD-style license
             *  that can be found in the LICENSE file in the root of the source
             *  tree.
             */
            'use strict';
            var safariShim = {
                // TODO: DrAlex, should be here, double check against LayoutTests

                // TODO: once the back-end for the mac port is done, add.
                // TODO: check for webkitGTK+
                // shimPeerConnection: function() { },

                shimOnAddStream: function() {
                    if (typeof window === 'object' && window.RTCPeerConnection &&
                        !('onaddstream' in window.RTCPeerConnection.prototype)) {
                        Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
                            get: function() {
                                return this._onaddstream;
                            },
                            set: function(f) {
                                if (this._onaddstream) {
                                    this.removeEventListener('addstream', this._onaddstream);
                                    this.removeEventListener('track', this._onaddstreampoly);
                                }
                                this.addEventListener('addstream', this._onaddstream = f);
                                this.addEventListener('track', this._onaddstreampoly = function(e) {
                                    var stream = e.streams[0];
                                    if (!this._streams) {
                                        this._streams = [];
                                    }
                                    if (this._streams.indexOf(stream) >= 0) {
                                        return;
                                    }
                                    this._streams.push(stream);
                                    var event = new Event('addstream');
                                    event.stream = e.streams[0];
                                    this.dispatchEvent(event);
                                }.bind(this));
                            }
                        });
                    }
                },

                shimGetUserMedia: function() {
                    if (!navigator.getUserMedia) {
                        if (navigator.webkitGetUserMedia) {
                            navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
                        } else if (navigator.mediaDevices &&
                            navigator.mediaDevices.getUserMedia) {
                            navigator.getUserMedia = function(constraints, cb, errcb) {
                                navigator.mediaDevices.getUserMedia(constraints)
                                    .then(cb, errcb);
                            }.bind(navigator);
                        }
                    }
                }
            };

            // Expose public methods.
            module.exports = {
                shimOnAddStream: safariShim.shimOnAddStream,
                shimGetUserMedia: safariShim.shimGetUserMedia
                // TODO
                // shimPeerConnection: safariShim.shimPeerConnection
            };

        }, {}],
        11: [function(require, module, exports) {
            /*
             *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
             *
             *  Use of this source code is governed by a BSD-style license
             *  that can be found in the LICENSE file in the root of the source
             *  tree.
             */
            /* eslint-env node */
            'use strict';

            var logDisabled_ = true;

            // Utility methods.
            var utils = {
                disableLog: function(bool) {
                    if (typeof bool !== 'boolean') {
                        return new Error('Argument type: ' + typeof bool +
                            '. Please use a boolean.');
                    }
                    logDisabled_ = bool;
                    return (bool) ? 'adapter.js logging disabled' :
                        'adapter.js logging enabled';
                },

                log: function() {
                    if (typeof window === 'object') {
                        if (logDisabled_) {
                            return;
                        }
                        if (typeof console !== 'undefined' && typeof console.log === 'function') {
                            console.log.apply(console, arguments);
                        }
                    }
                },

                /**
                 * Extract browser version out of the provided user agent string.
                 *
                 * @param {!string} uastring userAgent string.
                 * @param {!string} expr Regular expression used as match criteria.
                 * @param {!number} pos position in the version string to be returned.
                 * @return {!number} browser version.
                 */
                extractVersion: function(uastring, expr, pos) {
                    var match = uastring.match(expr);
                    return match && match.length >= pos && parseInt(match[pos], 10);
                },

                /**
                 * Browser detector.
                 *
                 * @return {object} result containing browser and version
                 *     properties.
                 */
                detectBrowser: function() {
                    // Returned result object.
                    var result = {};
                    result.browser = null;
                    result.version = null;

                    // Fail early if it's not a browser
                    if (typeof window === 'undefined' || !window.navigator) {
                        result.browser = 'Not a browser.';
                        return result;
                    }

                    // Firefox.
                    if (navigator.mozGetUserMedia) {
                        result.browser = 'firefox';
                        result.version = this.extractVersion(navigator.userAgent,
                            /Firefox\/(\d+)\./, 1);
                    } else if (navigator.webkitGetUserMedia) {
                        // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
                        if (window.webkitRTCPeerConnection) {
                            result.browser = 'chrome';
                            result.version = this.extractVersion(navigator.userAgent,
                                /Chrom(e|ium)\/(\d+)\./, 2);
                        } else { // Safari (in an unpublished version) or unknown webkit-based.
                            if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
                                result.browser = 'safari';
                                result.version = this.extractVersion(navigator.userAgent,
                                    /AppleWebKit\/(\d+)\./, 1);
                            } else { // unknown webkit-based browser.
                                result.browser = 'Unsupported webkit-based browser ' +
                                    'with GUM support but no WebRTC support.';
                                return result;
                            }
                        }
                    } else if (navigator.mediaDevices &&
                        navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) { // Edge.
                        result.browser = 'edge';
                        result.version = this.extractVersion(navigator.userAgent,
                            /Edge\/(\d+).(\d+)$/, 2);
                    } else if (navigator.mediaDevices &&
                        navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) {
                        // Safari, with webkitGetUserMedia removed.
                        result.browser = 'safari';
                        result.version = this.extractVersion(navigator.userAgent,
                            /AppleWebKit\/(\d+)\./, 1);
                    } else { // Default fallthrough: not supported.
                        result.browser = 'Not a supported browser.';
                        return result;
                    }

                    return result;
                },

                // shimCreateObjectURL must be called before shimSourceObject to avoid loop.

                shimCreateObjectURL: function() {
                    if (!(typeof window === 'object' && window.HTMLMediaElement &&
                            'srcObject' in window.HTMLMediaElement.prototype)) {
                        // Only shim CreateObjectURL using srcObject if srcObject exists.
                        return undefined;
                    }

                    var nativeCreateObjectURL = URL.createObjectURL.bind(URL);
                    var nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
                    var streams = new Map(),
                        newId = 0;

                    URL.createObjectURL = function(stream) {
                        if ('getTracks' in stream) {
                            var url = 'polyblob:' + (++newId);
                            streams.set(url, stream);
                            console.log('URL.createObjectURL(stream) is deprecated! ' +
                                'Use elem.srcObject = stream instead!');
                            return url;
                        }
                        return nativeCreateObjectURL(stream);
                    };
                    URL.revokeObjectURL = function(url) {
                        nativeRevokeObjectURL(url);
                        streams.delete(url);
                    };

                    var dsc = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype,
                        'src');
                    Object.defineProperty(window.HTMLMediaElement.prototype, 'src', {
                        get: function() {
                            return dsc.get.apply(this);
                        },
                        set: function(url) {
                            this.srcObject = streams.get(url) || null;
                            return dsc.set.apply(this, [url]);
                        }
                    });

                    var nativeSetAttribute = HTMLMediaElement.prototype.setAttribute;
                    HTMLMediaElement.prototype.setAttribute = function() {
                        if (arguments.length === 2 &&
                            ('' + arguments[0]).toLowerCase() === 'src') {
                            this.srcObject = streams.get(arguments[1]) || null;
                        }
                        return nativeSetAttribute.apply(this, arguments);
                    };
                }
            };

            // Export.
            module.exports = {
                log: utils.log,
                disableLog: utils.disableLog,
                browserDetails: utils.detectBrowser(),
                extractVersion: utils.extractVersion,
                shimCreateObjectURL: utils.shimCreateObjectURL,
                detectBrowser: utils.detectBrowser.bind(utils)
            };

        }, {}]
    }, {}, [2])(2)
});
