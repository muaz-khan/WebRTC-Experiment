// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - github.com/muaz-khan/WebRTC-Experiment/tree/master/getMediaElement

// Demo          - www.WebRTC-Experiment.com/getMediaElement

// __________________
// getMediaElement.js

document.write('<link rel="stylesheet" href="https://www.WebRTC-Experiment.com/getMediaElement.css">');

function getMediaElement(mediaElement, config) {
    config = config || { };
	
    mediaElement.controls = mediaElement.nodeName.toLowerCase() == 'video' ? false : true;

    var buttons = config.buttons || ['mute-audio', 'mute-video', 'full-screen', 'volume-slider', 'stop'];
    buttons.has = function(element) {
        return buttons.indexOf(element) !== -1;
    };

    var mediaElementContainer = document.createElement('div');
    mediaElementContainer.className = 'media-container';

    var mediaControls = document.createElement('div');
    mediaControls.className = 'media-controls';
    mediaElementContainer.appendChild(mediaControls);

    if (buttons.has('mute-audio')) {
        var muteAudio = document.createElement('div');
        muteAudio.innerHTML = '<span>Mute Audio</span>';
        muteAudio.className = 'control mute-audio';
        mediaControls.appendChild(muteAudio);

        muteAudio.onclick = function() {
            if (muteAudio.className.indexOf('unmute-audio') != -1) {
                muteAudio.className = muteAudio.className.replace('unmute-audio selected', 'mute-audio');
                muteAudio.innerHTML = '<span>Mute Audio</span>';
                mediaElement.muted = false;
                if (config.onUnMuted) config.onUnMuted('audio');
            } else {
                muteAudio.className = muteAudio.className.replace('mute-audio', 'unmute-audio selected');
                muteAudio.innerHTML = '<span>UnMute Audio</span>';
                mediaElement.muted = true;
                if (config.onMuted) config.onMuted('audio');
            }
        };
    }

    if (buttons.has('mute-video')) {
        var muteVideo = document.createElement('div');
        muteVideo.innerHTML = '<span>Mute Video</span>';
        muteVideo.className = 'control mute-video';
        mediaControls.appendChild(muteVideo);

        muteVideo.onclick = function() {
            if (muteVideo.className.indexOf('unmute-video') != -1) {
                muteVideo.className = muteVideo.className.replace('unmute-video selected', 'mute-video');
                muteVideo.innerHTML = '<span>Mute Video</span>';
                mediaElement.play();
                if (config.onUnMuted) config.onUnMuted('video');
            } else {
                muteVideo.className = muteVideo.className.replace('mute-video', 'unmute-video selected');
                muteVideo.innerHTML = '<span>UnMute Video</span>';
                mediaElement.pause();
                if (config.onMuted) config.onMuted('video');
            }
        };
    }

    if (buttons.has('record-audio')) {
        var recordAudio = document.createElement('div');
        recordAudio.innerHTML = '<span>Record Audio</span>';
        recordAudio.className = 'control record-audio';
        mediaControls.appendChild(recordAudio);

        recordAudio.onclick = function() {
            if (recordAudio.className.indexOf('stop-recording-audio') != -1) {
                recordAudio.className = recordAudio.className.replace('stop-recording-audio selected', 'record-audio');
                recordAudio.innerHTML = '<span>Record Audio</span>';
                if (config.onRecordingStopped) config.onRecordingStopped('audio');
            } else {
                recordAudio.className = recordAudio.className.replace('record-audio', 'stop-recording-audio selected');
                recordAudio.innerHTML = '<span>Stop Recording Audio</span>';
                if (config.onRecordingStarted) config.onRecordingStarted('audio');
            }
        };
    }

    if (buttons.has('record-video')) {
        var recordVideo = document.createElement('div');
        recordVideo.innerHTML = '<span>Record Video</span>';
        recordVideo.className = 'control record-video';
        mediaControls.appendChild(recordVideo);

        recordVideo.onclick = function() {
            if (recordVideo.className.indexOf('stop-recording-video') != -1) {
                recordVideo.className = recordVideo.className.replace('stop-recording-video selected', 'record-video');
                recordVideo.innerHTML = '<span>Record Video</span>';
                if (config.onRecordingStopped) config.onRecordingStopped('video');
            } else {
                recordVideo.className = recordVideo.className.replace('record-video', 'stop-recording-video selected');
                recordVideo.innerHTML = '<span>Stop Recording Video</span>';
                if (config.onRecordingStarted) config.onRecordingStarted('video');
            }
        };
    }

    if (buttons.has('stop')) {
        var stop = document.createElement('div');
        stop.innerHTML = '<span>Stop</span>';
        stop.className = 'control stop';
        mediaControls.appendChild(stop);

        stop.onclick = function() {
            mediaElementContainer.style.opacity = 0;
            setTimeout(function() {
                if (mediaElementContainer.parentNode) {
                    mediaElementContainer.parentNode.removeChild(mediaElementContainer);
                }
            }, 800);
            if (config.onStopped) config.onStopped();
        };
    }

    var volumeControl = document.createElement('div');
    volumeControl.className = 'volume-control';

    if (buttons.has('volume-slider')) {
        var volumeDown = document.createElement('div');
        volumeDown.className = 'control volume-down';
        volumeControl.appendChild(volumeDown);

        volumeDown.onclick = function() {
            var value = parseInt(slider.value);
            if (value > 0)
                slider.value = value - 10;

            slider.onchange();
        };

        var volumeSlider = document.createElement('div');
        volumeSlider.className = 'control volume-slider';
        volumeControl.appendChild(volumeSlider);

        var slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 100;
        slider.value = 100;
        slider.onchange = function() {
            mediaElement.volume = '.' + slider.value.toString().substr(0, 1);
        };
        volumeSlider.appendChild(slider);

        var volumeUp = document.createElement('div');
        volumeUp.className = 'control volume-up';
        volumeControl.appendChild(volumeUp);

        volumeUp.onclick = function() {
            var value = parseInt(slider.value);
            if (value < 100)
                slider.value = value + 10;

            slider.onchange();
        };
    }

    if (buttons.has('full-screen')) {
        var zoom = document.createElement('div');
        zoom.className = 'control zoom-in';
        volumeControl.appendChild(zoom);

        zoom.onclick = function() {
            if (zoom.className.indexOf('zoom-out') != -1) {
                zoom.className = zoom.className.replace('zoom-out selected', 'zoom-in');
                exitFullScreen();
                if (config.onZoomout) config.onZoomout();
            } else {
                zoom.className = zoom.className.replace('zoom-in', 'zoom-out selected');
                launchFullscreen(mediaElementContainer);
                if (config.onZoomin) config.onZoomin();
            }
        };

        function launchFullscreen(element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }

        function exitFullScreen() {
            if (document.fullscreen) {
                document.cancelFullScreen();
            }

            if (document.mozFullScreen) {
                document.mozCancelFullScreen();
            }

            if (document.webkitIsFullScreen) {
                document.webkitCancelFullScreen();
            }
        }

        function screenStateChange(e) {
            if (e.srcElement != mediaElementContainer) return;

            var isFullScreeMode = document.webkitIsFullScreen || document.mozFullScreen || document.fullscreen;

            mediaElementContainer.style.width = (isFullScreeMode ? (window.innerWidth - 20) : config.width) + 'px';
            mediaElementContainer.style.display = isFullScreeMode ? 'block' : 'inline-block';

            if (config.height) {
                mediaElementContainer.style.height = (isFullScreeMode ? (window.innerHeight - 20) : config.height) + 'px';
            }

            if (!isFullScreeMode && zoom.className.indexOf('zoom-out') != -1) {
                zoom.className = zoom.className.replace('zoom-out selected', 'zoom-in');
                if (config.onZoomout) config.onZoomout();
            }
            setTimeout(adjustControls, 1000);
        }

        ;

        document.addEventListener('fullscreenchange', screenStateChange, false);
        document.addEventListener('mozfullscreenchange', screenStateChange, false);
        document.addEventListener('webkitfullscreenchange', screenStateChange, false);
    }

    if (buttons.has('volume-slider') || buttons.has('full-screen')) {
        mediaElementContainer.appendChild(volumeControl);
    }

    var mediaBox = document.createElement('div');
    mediaBox.className = 'media-box';
    mediaElementContainer.appendChild(mediaBox);

    mediaBox.appendChild(mediaElement);

    if (!config.width) config.width = (innerWidth / 2) - 50;

    mediaElementContainer.style.width = config.width + 'px';

    if (config.height) {
        mediaElementContainer.style.height = config.height + 'px';
    }

    var times = 0;

    function adjustControls() {
        mediaControls.style.marginLeft = (mediaElementContainer.clientWidth - mediaControls.clientWidth - 7) + 'px';

        volumeControl.style.marginLeft = (mediaElementContainer.clientWidth - volumeControl.clientWidth - 7) + 'px';
        volumeControl.style.marginTop = (mediaElementContainer.clientHeight - volumeControl.clientHeight - 6) + 'px';

        if (times < 10) {
            times++;
            setTimeout(adjustControls, 1000);
        } else times = 0;
    }

    if (config.showOnMouseEnter || typeof config.showOnMouseEnter === 'undefined') {
        mediaElementContainer.onmouseenter = function() {
            adjustControls();
            mediaControls.style.opacity = 1;
            volumeControl.style.opacity = 1;
        };

        mediaElementContainer.onmouseleave = function() {
            mediaControls.style.opacity = 0;
            volumeControl.style.opacity = 0;
        };
    } else {
        setTimeout(function() {
            adjustControls();
            setTimeout(function() {
                mediaControls.style.opacity = 1;
                volumeControl.style.opacity = 1;
            }, 300);
        }, 700);
    }

    adjustControls();

    if (config.enableTooltip || typeof config.enableTooltip === 'undefined') {
        var controls = mediaElementContainer.querySelectorAll('.control');
        for (var i = 0; i < controls.length; i++) {
            controls[i].onmouseenter = function() {
                if (!this.querySelector('span')) return;
                this.querySelector('span').style.opacity = 1;
            };

            controls[i].addEventListener('click', function() {
                if (!this.querySelector('span')) return;
                this.querySelector('span').style.opacity = 1;
            });

            controls[i].onmouseleave = function() {
                if (!this.querySelector('span')) return;
                this.querySelector('span').style.opacity = 0;
            };
        }
    }

    mediaElementContainer.toggle = function(clasName) {
        if (typeof clasName != 'string') {
            for (i = 0; i < clasName.length; i++) {
                mediaElementContainer.toggle(clasName[i]);
            }
            return;
        }

        if (clasName == 'mute-audio' && muteAudio) muteAudio.onclick();
        if (clasName == 'mute-video' && muteVideo) muteVideo.onclick();

        if (clasName == 'record-audio' && recordAudio) recordAudio.onclick();
        if (clasName == 'record-video' && recordVideo) recordVideo.onclick();

        if (clasName == 'stop' && stop) stop.onclick();

        return this;
    };

    return mediaElementContainer;
}
