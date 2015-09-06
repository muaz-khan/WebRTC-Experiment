var moz = !!navigator.mozGetUserMedia;
var IsDataChannelSupported = !((moz && !navigator.mozGetUserMedia) || (!moz && !navigator.webkitGetUserMedia));

function getRandomString() {
    return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '-');
}

var userid = getRandomString();

var isMobileDevice = navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);
var isChrome = !!navigator.webkitGetUserMedia;
var isFirefox = !!navigator.mozGetUserMedia;

var chromeVersion = 50;
if (isChrome) {
    chromeVersion = !!navigator.mozGetUserMedia ? 0 : parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);
}

function swap(arr) {
    var swapped = [];
    var length = arr.length;

    for (var i = 0; i < length; i++) {
        if (arr[i]) {
            swapped.push(arr[i]);
        }
    }

    return swapped;
}

function listenEventHandler(eventName, eventHandler) {
    window.removeEventListener(eventName, eventHandler);
    window.addEventListener(eventName, eventHandler, false);
}
