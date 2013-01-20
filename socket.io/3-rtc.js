/* ---------- common configuration -------- */
var config = {};

function initconfig()
{
	config = {
	    onICE: sendice,
	    onRemoteStream: gotstream,
	    iceServers: iceServers,
	    attachStream: global.clientStream,
	    isopus: isopus
	};
}

/* ---------- called in case of offer -------- */
function createOffer() {
	initconfig();
    config.onOfferSDP = sendsdp;
    global.rtc = RTCPeerConnection(config);
}

/* ---------- called in case of answer -------- */
function createAnswer(sdp) {
	initconfig();
    config.onAnswerSDP = sendsdp;
    config.offerSDP = sdp;
    global.rtc = RTCPeerConnection(config);
}