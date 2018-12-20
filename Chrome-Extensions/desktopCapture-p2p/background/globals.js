var runtimePort;

var desktop_id;
var constraints;
var room_password = '';
var room_id = '';
var codecs = 'default';
var bandwidth;

var enableTabCaptureAPI;
var enableMicrophone;
var enableSpeakers;
var enableCamera;
var enableScreen;
var isSharingOn;

var streaming_method = 'RTCMultiConnection';

var room_url_box = true;

var connection; // RTCMultiConnection
var popup_id;

var videoPlayers = [];

var microphoneDevice = false;
var cameraDevice = false;
