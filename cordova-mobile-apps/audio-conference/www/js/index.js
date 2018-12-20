var app = {
    logs: [],
    initialize: function() {
        console.error = window.onerror = console.log = console.debug = console.info = function() {
            if (JSON.stringify(arguments).indexOf('iosrtc') !== -1) {
                return;
            }

            if (JSON.stringify(arguments).indexOf('No Content-Security-Policy') !== -1) {
                return;
            }

            if (JSON.stringify(arguments).indexOf('<') !== -1) {
                return;
            }

            app.logs.push(JSON.stringify(arguments, null, ' '));
        };

        app.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', app.onDeviceReady, false);

        document.getElementById('btn-hide-logs').onclick = function() {
            var logsPreview = document.getElementById('logs-preview');
            logsPreview.style.display = 'none';
        };

        document.getElementById('how-to-use').onclick = function(e) {
            e.preventDefault();
            var logs = app.getHowToUse();
            var logsPreview = document.getElementById('logs-preview');
            logsPreview.querySelector('.logs').innerHTML = logs.join('<br>');
            logsPreview.style.display = 'block';
        };

        document.getElementById('view-logs').onclick = function(e) {
            e.preventDefault();
            var logs = app.logs;

            if(!logs.length) {
                logs.push('No logs yet.');
            }

            var logsPreview = document.getElementById('logs-preview');
            logsPreview.querySelector('.logs').innerHTML = logs.join('<br>');
            logsPreview.style.display = 'block';
        };

        document.getElementById('bug-reports').onclick = function(e) {
            e.preventDefault();
            var logs = app.getBugReports();
            var logsPreview = document.getElementById('logs-preview');
            logsPreview.querySelector('.logs').innerHTML = logs.join('<br>');
            logsPreview.style.display = 'block';
        };
    },
    checkAndroidPermissions: function(callback) {
        if (device.platform !== 'Android') {
            callback();
            return;
        }

        var permissions = cordova.plugins.permissions;

        var arr = [
            permissions.RECORD_AUDIO,
            permissions.MODIFY_AUDIO_SETTINGS
        ];

        permissions.hasPermission(arr, function(status) {
            if (status.hasPermission) {
                callback();
                return;
            }

            permissions.requestPermissions(arr, function(status) {
                if (status.hasPermission) {
                    callback();
                    return;
                }
                alert('Please manually enable microphone permissions.');
            }, function() {
                alert('Please manually enable microphone permissions.');
            });
        }, function() {
            alert('Please manually enable microphone permissions.');
        });
    },
    onDeviceReady: function() {
        // original demo: https://rtcmulticonnection.herokuapp.com/demos/audio-conferencing.html

        // ......................................................
        // .......................UI Code........................
        // ......................................................
        document.getElementById('open-room').onclick = function() {
            disableInputButtons();
            
            app.checkAndroidPermissions(function() {
                connection.open(document.getElementById('room-id').value, function() {
                    showRoomURL(connection.sessionid);
                });
            });
        };

        document.getElementById('join-room').onclick = function() {
            disableInputButtons();

            app.checkAndroidPermissions(function() {
                connection.join(document.getElementById('room-id').value, function() {
                    showRoomURL(connection.sessionid);
                });
            });
        };

        document.getElementById('open-or-join-room').onclick = function() {
            disableInputButtons();

            app.checkAndroidPermissions(function() {
                connection.openOrJoin(document.getElementById('room-id').value, function(isRoomExist, roomid) {
                    showRoomURL(roomid);
                });
            });
        };

        // ......................................................
        // ..................RTCMultiConnection Code.............
        // ......................................................

        window.enableAdapter = false;

        var connection = new RTCMultiConnection();

        connection.onMediaError = function(error, constraints) {
            alert(JSON.stringify(error, null, ' '));
        };

        // http://www.rtcmulticonnection.org/docs/socketURL/
        connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

        connection.socketMessageEvent = 'audio-conference-demo';

        connection.session = {
            audio: true
        };

        connection.mediaConstraints = {
            audio: true
        };

        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: false
        };

        connection.onstream = function(event) {
            document.querySelector('header').style.paddingTop = 0;
            event.mediaElement.id = null;
            event.mediaElement.src = null;
            event.mediaElement.pause();

            if(event.type === 'local') {
                document.querySelector('#local-audio').parentNode.style.display = '';
                document.querySelector('#local-audio').src = URL.createObjectURL(event.stream);
            }

            if(event.type === 'remote') {
                document.querySelector('#remote-audio').parentNode.style.display = '';
                document.querySelector('#remote-audio').src = URL.createObjectURL(event.stream);
            }

            connection.fixAllAudios();
        };

        document.querySelector('#remote-audio').onclick = document.querySelector('#local-audio').onclick = function() {
            connection.fixAllAudios();
        };

        connection.onstreamended = function(event) {
            if(event.type === 'local') {
                document.querySelector('#local-audio').src = null;
                document.querySelector('#local-audio').parentNode.style.display = 'none';
            }

            if(event.type === 'remote') {
                document.querySelector('#remote-audio').src = null;
                document.querySelector('#remote-audio').parentNode.style.display = 'none';
            }
        };

        function disableInputButtons() {
            document.getElementById('open-or-join-room').disabled = true;
            document.getElementById('open-room').disabled = true;
            document.getElementById('join-room').disabled = true;
            document.getElementById('room-id').disabled = true;
        }

        // ......................................................
        // ......................Handling Room-ID................
        // ......................................................

        function showRoomURL(roomid) {
            var roomHashURL = '#' + roomid;
            var roomQueryStringURL = '?roomid=' + roomid;

            var html = '<h2>Unique URL for your room:</h2><br>';

            html += '<a href="https://bit.ly/rmc3_conference' + roomHashURL + '" target="_blank">bit.ly/rmc3_conference' + roomHashURL + '</a>';

            var roomURLsDiv = document.getElementById('room-urls');
            roomURLsDiv.innerHTML = html;

            roomURLsDiv.style.display = 'block';
            document.getElementById('hide-after-openOrJoin').style.display = 'none';
        }

        (function() {
            var params = {},
                r = /([^&=]+)=?([^&]*)/g;

            function d(s) {
                return decodeURIComponent(s.replace(/\+/g, ' '));
            }
            var match, search = window.location.search;
            while (match = r.exec(search.substring(1)))
                params[d(match[1])] = d(match[2]);
            window.params = params;
        })();

        var roomid = '';
        if (localStorage.getItem(connection.socketMessageEvent)) {
            roomid = localStorage.getItem(connection.socketMessageEvent);
        } else {
            roomid = connection.token();
        }
        document.getElementById('room-id').value = roomid;
        document.getElementById('room-id').onkeyup = function() {
            localStorage.setItem(connection.socketMessageEvent, this.value);
        };

        var hashString = location.hash.replace('#', '');
        if (hashString.length && hashString.indexOf('comment-') == 0) {
            hashString = '';
        }

        var roomid = params.roomid;
        if (!roomid && hashString.length) {
            roomid = hashString;
        }

        if (roomid && roomid.length) {
            document.getElementById('room-id').value = roomid;
            localStorage.setItem(connection.socketMessageEvent, roomid);

            // auto-join-room
            (function reCheckRoomPresence() {
                connection.checkPresence(roomid, function(isRoomExist) {
                    if (isRoomExist) {
                        connection.join(roomid);
                        return;
                    }

                    setTimeout(reCheckRoomPresence, 5000);
                });
            })();

            disableInputButtons();
        }

        window.closeEverything = function() {
            document.querySelector('#local-audio').src = null;
            document.querySelector('#remote-audio').src = null;
            document.querySelector('#local-audio').parentNode.style.display = 'none';
            document.querySelector('#remote-audio').parentNode.style.display = 'none';

            connection.close();
            connection.closeSocket();

            location.reload();
        };

        connection.fixAllAudios = function() {
            Object.keys(connection.streamEvents).forEach(function(key) {
                var event = connection.streamEvents[key];
                if(!event) return;

                if(event.type === 'local') {
                    document.querySelector('#local-audio').parentNode.style.display = '';
                    document.querySelector('#local-audio').src = URL.createObjectURL(event.stream);
                }

                if(event.type === 'remote') {
                    document.querySelector('#remote-audio').parentNode.style.display = '';
                    document.querySelector('#remote-audio').src = URL.createObjectURL(event.stream);
                }
            });

            var nav = document.querySelector('nav');
            nav.style.zIndex = 9;
        };

        connection.onPeerStateChanged = function(event) {
            if(event.iceConnectionState.search(/closed|failed/gi) !== -1) {
                window.closeEverything();
            }
        };
    },
    logs: [],
    getHowToUse: function() {
        var arr = [];
        arr.push('Enter something unique in the text box.');
        arr.push('Click "Open Room" button to start a audio conferencing room.');
        arr.push('Ask your friends to enter same thing in the text box.');
        arr.push('Your friends must click "Join Room" button to join you.');
        arr.push('If you are asked to enable mic, then please grant all such permissions.');
        return arr;
    },
    getBugReports: function() {
        var arr = [];
        arr.push('Please send email to: <a href="mailto:muazkh@gmail.com">muazkh@gmail.com</a>');
        arr.push('Or open an issue here: <a href="https://github.com/muaz-khan/RTCMultiConnection/issues">https://github.com/muaz-khan/RTCMultiConnection/issues</a>');
        return arr;
    }
};

app.initialize();
