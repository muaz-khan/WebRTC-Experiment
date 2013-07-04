// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Experiments - https://github.com/muaz-khan/WebRTC-Experiment
// -----------------------------------
// The purpose of this library is to explain possible customization
// of session description (sdp).
// 
// It will be updated for each new hack!
// -----------------------------------
// Serializes the passed in SessionDescription string.
var SdpSerializer = {};

// kApplicationSpecificMaximum="AS"=50/256/1638400
// SdpSerializer.SerializeAS(sdp, {audio,video,data});
SdpSerializer.SerializeAS = function (sdp, bandwidth) {
    bandwidth = bandwidth || {};

    // remove existing bandwidth lines
    sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');

    sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + (bandwidth.audio || 50) + '\r\n');
    sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + (bandwidth.video || 256) + '\r\n');
    sdp = sdp.replace(/a=mid:data\r\n/g, 'a=mid:data\r\nb=AS:' + (bandwidth.data || 1638400) + '\r\n');

    return sdp;
};

// SdpSerializer.SerializePTime(sdp, {minptime,maxptime});
// You can say it "framerate" for audio RTP ports
SdpSerializer.SerializePTime = function (sdp, ptimes) {
    ptimes = ptimes || {};
	
    sdp = sdp.replace('a=fmtp:111 minptime=10', 'a=fmtp:111 minptime=' + (ptimes.minptime || 10));
    sdp = sdp.replace('a=maxptime:60', 'a=maxptime:' + (ptimes.maxptime || 60));
	
    return sdp;
};

SdpSerializer.SerializeGoogleMinBitrate = function (sdp, bitrate) {
    sdp = sdp.replace(/a=mid:video\r\n/g,
        'a=mid:video\r\na=rtpmap:120 VP8/90000\r\na=fmtp:120 \
							x-google-min-bitrate=' + (bitrate || 10) + '\r\n');
    return sdp;
};

// to skip UDP ports
SdpSerializer.RTPOverTCP = function (sdp) {
    return sdp.replace(/a=candidate:.*udp.*\r\n/g, '');
};