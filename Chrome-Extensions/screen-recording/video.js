// var src = location.href.split('?src=')[1];
// document.querySelector('video').src = src;

var video = document.querySelector('video');
video.style.height = parseInt(innerHeight - 100) + 'px';

var deviceId = {};
chrome.storage.sync.get(null, function(items) {
    var hints = {
        video: true
    };

    if(items['camera'] && typeof items['camera'] === 'string') {
        hints.video = {
            deviceId: items['camera']
        };
    }

    if(items['videoResolutions'] && items['videoResolutions'] !== 'default') {
        var videoResolutions = items['videoResolutions'];

        if(hints.video === true) {
            hints.video = {};
        }

        var width = videoResolutions.split('x')[0];
        var height = videoResolutions.split('x')[1];

        if(width && height) {
            hints.video.width = {
                ideal: width
            };

            hints.video.height = {
                ideal: height
            };
        }
    }

    navigator.mediaDevices.getUserMedia(hints).then(function(stream) {
        video.srcObject = stream;
    }).catch(function() {
        // retry with default devices
        hints = {
            video: true
        };

        navigator.mediaDevices.getUserMedia(hints).then(function(stream) {
            video.srcObject = stream;
        }).catch(function() {
            alert('Unable to capture your camera.');
        });
    });
});


document.querySelector('button').onclick = function() {
    window.close();
};

function msToTime(s) {
    function addZ(n) {
        return (n < 10 ? '0' : '') + n;
    }

    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return addZ(mins) + ':' + addZ(secs);
}

var span = document.querySelector('span');
var startedAt = (new Date).getTime();
var counter = 1;
(function looper() {
    counter ++;

    if(counter % 2 == 0) {
        span.style.color = 'red';
    }
    else {
        span.style.color = 'black';
    }

    var current = (new Date).getTime() - startedAt;
    span.innerHTML = msToTime(current);
    setTimeout(looper, 1000);
})();
