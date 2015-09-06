// _____________________________
// Cross-Browser-Declarations.js

// animation-frame used in WebM recording
if (typeof requestAnimationFrame === 'undefined') {
    if (typeof webkitRequestAnimationFrame !== 'undefined') {
        /*global requestAnimationFrame:true */
        var requestAnimationFrame = webkitRequestAnimationFrame;
    }

    if (typeof mozRequestAnimationFrame !== 'undefined') {
        /*global requestAnimationFrame:true */
        var requestAnimationFrame = mozRequestAnimationFrame;
    }
}

if (typeof cancelAnimationFrame === 'undefined') {
    if (typeof webkitCancelAnimationFrame !== 'undefined') {
        /*global cancelAnimationFrame:true */
        var cancelAnimationFrame = webkitCancelAnimationFrame;
    }

    if (typeof mozCancelAnimationFrame !== 'undefined') {
        /*global cancelAnimationFrame:true */
        var cancelAnimationFrame = mozCancelAnimationFrame;
    }
}

// WebAudio API representer
if (typeof AudioContext === 'undefined') {
    if (typeof webkitAudioContext !== 'undefined') {
        /*global AudioContext:true */
        var AudioContext = webkitAudioContext;
    }

    if (typeof mozAudioContext !== 'undefined') {
        /*global AudioContext:true */
        var AudioContext = mozAudioContext;
    }
}

if (typeof URL === 'undefined' && typeof webkitURL !== 'undefined') {
    /*global URL:true */
    var URL = webkitURL;
}

var isChrome = true;

if (typeof navigator !== 'undefined') {
    if (typeof navigator.webkitGetUserMedia !== 'undefined') {
        navigator.getUserMedia = navigator.webkitGetUserMedia;
    }

    if (typeof navigator.mozGetUserMedia !== 'undefined') {
        navigator.getUserMedia = navigator.mozGetUserMedia;
    }

    isChrome = typeof navigator.webkitGetUserMedia !== 'undefined';
} else {
    /*global navigator:true */
    var navigator = {
        getUserMedia: {}
    };
}

if (typeof webkitMediaStream !== 'undefined') {
    var MediaStream = webkitMediaStream;
}

if (typeof location !== 'undefined') {
    if (location.href.indexOf('file:') === 0) {
        console.error('Please load this HTML file on HTTP or HTTPS.');
    }
}

// below function via: http://goo.gl/B3ae8c
/**
 * @param {number} bytes - Pass bytes and get formafted string.
 * @returns {string} - formafted string
 * @example
 * bytesToSize(1024*1024*5) === '5 GB'
 */
function bytesToSize(bytes) {
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Bytes';
    }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

function invokeSaveAsDialog(file, fileName) {
    if (!file) {
        throw 'Blob object is required.';
    }

    if (!file.type) {
        file.type = 'video/webm';
    }

    var fileExtension = file.type.split('/')[1];

    if (fileName && fileName.indexOf('.') !== -1) {
        var splitted = fileName.split('.');
        fileName = splitted[0];
        fileExtension = splitted[1];
    }

    var fileFullName = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + fileExtension;

    if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
        return navigator.msSaveOrOpenBlob(file, fileFullName);
    } else if (typeof navigator.msSaveBlob !== 'undefined') {
        return navigator.msSaveBlob(file, fileFullName);
    }

    var hyperlink = document.createElement('a');
    hyperlink.href = URL.createObjectURL(file);
    hyperlink.target = '_blank';
    hyperlink.download = fileFullName;

    if (!!navigator.mozGetUserMedia) {
        hyperlink.onclick = function() {
            (document.body || document.documentElement).removeChild(hyperlink);
        };
        (document.body || document.documentElement).appendChild(hyperlink);
    }

    var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    hyperlink.dispatchEvent(evt);

    if (!navigator.mozGetUserMedia) {
        URL.revokeObjectURL(hyperlink.href);
    }
}
