// requires: chrome://flags/#enable-experimental-web-platform-features

elementClass = elementClass || 'multi-streams-mixer';

var videos = [];
var isStopDrawingFrames = false;

var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
canvas.style.opacity = 0;
canvas.style.position = 'absolute';
canvas.style.zIndex = -1;
canvas.style.top = '-1000em';
canvas.style.left = '-1000em';
canvas.className = elementClass;
(document.body || document.documentElement).appendChild(canvas);

this.disableLogs = false;
this.frameInterval = 10;

this.width = 360;
this.height = 240;

// use gain node to prevent echo
this.useGainNode = true;

var self = this;
