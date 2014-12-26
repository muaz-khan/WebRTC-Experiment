// Last time updated at Dec 09, 2014, 08:32:23

// Quick-Demo for newbies: http://jsfiddle.net/c46de0L8/
// Another simple demo: http://jsfiddle.net/zar6fg60/

// Latest file can be found here: https://cdn.webrtc-experiment.com/RTCMultiConnection.js

// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - www.RTCMultiConnection.org/docs
// FAQ           - www.RTCMultiConnection.org/FAQ
// Changes log   - www.RTCMultiConnection.org/changes-log/
// Demos         - www.WebRTC-Experiment.com/RTCMultiConnection

// _________________________
// RTCMultiConnection-v2.2.4
/* issues/features need to be fixed & implemented:

-. v2.0.* changes-log here: http://www.rtcmulticonnection.org/changes-log/#v2.2
-. trello: https://trello.com/b/8bhi1G6n/rtcmulticonnection 

--. screen capturing improved & some bugs fixed.
--. connection.stopMediaStream improved.
--. fixed: audio-only stream & crash.
--. added: connection.attachExternalStream(MediaStream, isScreen);
--. connection.candidates={relay:true} fixed. (a=candidate is removed).
--. connection.numberOfConnectedUsers is fixed.
--. hark.js updated. "onspeaking" is disabled for remote streams. Check "Coding Tricks" wiki page for further details.
--. Now, stream object is having "pause" and "resume" methods to pause/resume hark.js instances.

--. connection.rtcConfiguration
--. takeSnapshot now returns "blob" as second argument.
--. Renegotiation is fixed for Firefox. Removing old stream and using new one.
--. Fixed: If stream is having no audio or video tracks but session=audio:true,video:true
--. Fixed: onstatechange isn't firing "request-accepted".

NEW/Breaking changes:
--. RTCMultiSession is renamed to "SignalingHandler"
--. "PeerConnection" is renamed to "RTCPeerConnectionHandler"
--. MultiSockets concept has been removed. Now there is always single socket.
*/

'use strict';

(function() {
