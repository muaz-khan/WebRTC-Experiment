var app = {
    initialize: function() {
        console.error = window.onerror = function() {
            if(JSON.stringify(arguments).indexOf('iosrtc') !== -1) {
                return;
            }

            if(JSON.stringify(arguments).indexOf('No Content-Security-Policy') !== -1) {
                return;
            }

            if(JSON.stringify(arguments).indexOf('<') !== -1) {
                return;
            }

            document.getElementById('logs').innerHTML += '<br><p style="color:red;">' + JSON.stringify(arguments, null, ' ') + '</p>';
        };

        if(typeof device !== 'undefined' && device.platform !== 'Android') {
            document.querySelector('#exit-app').style.display = 'none';
        }

        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', app.onDeviceReady, false);
        document.addEventListener('resume', function() {
            if(window.connection && connection.getAllParticipants().length) {
                return;
            }
            location.reload();
        }, false);

        document.addEventListener('online', function() {
            location.reload();
        }, false);

        document.addEventListener('offline', function() {
            appendLog('Seems disconnected.', 'red');
        }, false);
    },
    onDeviceReady: function() {
        if(device.platform !== 'Android') {
            document.querySelector('#exit-app').style.display = 'none';
        }

        if (window.localStorage.getItem('room-id')) {
            document.getElementById('room-id').value = window.localStorage.getItem('room-id');
        } else {
            document.getElementById('room-id').value = (Math.random() * 100).toString().replace('.', '');
        }

        document.getElementById('join-room').onclick = document.querySelector('.btn-select-file').onclick = function() {
            document.getElementById('join-room').onclick.disabled = true;
            document.getElementById('room-id').disabled = true;

            var roomId = document.getElementById('room-id').value;
            window.localStorage.setItem('room-id', roomId);

            joinARoom(roomId);
        };
    },
    saveToDisk: function(fileToSave, callback) {
        if(true || (fileToSave.type !== 'image/png' && fileToSave.type !== 'image/jpg' && fileToSave.type !== 'image/jpeg' && fileToSave.type !== 'image/gif')) {
            checkStoragePermissions(function() {
                app.saveToDisk2(fileToSave, callback);
            });
            return;
        }

        // above "true ||" is actually ignoring below code
        // i.e. below code will skipped unti if you remove "true||" from above if-block.
        // reason: because saveImageToPhone does not works correctly.

        var file = fileToSave.url ? fileToSave : new File([fileToSave], fileToSave.name || 'image.png', {
            type: fileToSave.type || 'image/png'
        });

        var image = document.createElement('img');
        image.onload = function() {
            checkStoragePermissions(function() {
                saveImageToPhone(image, function(path) {
                    callback('success', file, path);
                }, function(e) {
                    callback('failure', file, e.toString());
                });
            });
        };
        image.src = file.url || URL.createObjectURL(file);
    },
    saveToDisk2: function(fileToSave, callback) {
        var errorHandler = function (fileName, e) {  
            var msg = '';

            switch (e.code) {
                case FileError.QUOTA_EXCEEDED_ERR:
                    msg = 'Storage quota exceeded';
                    break;
                case FileError.NOT_FOUND_ERR:
                    msg = 'File not found';
                    break;
                case FileError.SECURITY_ERR:
                    msg = 'Security error';
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    msg = 'Invalid modification';
                    break;
                case FileError.INVALID_STATE_ERR:
                    msg = 'Invalid state';
                    break;
                default:
                    msg = 'Unknown error code: ' + e.code;
                    break;
            };

            callback('failure', fileToSave, msg);
        };

        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

        window.requestFileSystem(LocalFileSystem.PERSISTENT, fileToSave.size, function(fileSystem) {
            var path = cordova.file.externalRootDirectory;

            if(DetectRTC.osName == 'iOS') {
                path = path || cordova.file.externalDataDirectory || cordova.file.documentsDirectory || cordova.file.cacheDirectory;
            }
            
            if(!path || !path.length) {
                path = '';
            }

            window.resolveLocalFileSystemURL(path, function(directoryEntry) {
                directoryEntry.getFile(fileToSave.name, {
                    create: true,
                    exclusive: false
                }, function(fileEntry) {
                    fileEntry.createWriter(function(fileWriter) {
                        fileWriter.onwriteend = function(e) {
                            callback('success', fileToSave, fileWriter.localURL);
                        };

                        fileWriter.onerror = function(e) {
                            callback('failure', fileToSave, e.toString());
                        };

                        fileWriter.write(fileToSave);
                    }, errorHandler.bind(null, fileToSave.name));
                }, errorHandler.bind(null, fileToSave.name));
            }, errorHandler.bind(null, fileToSave.name));
        }, errorHandler.bind(null, fileToSave.name));
    }
};

function saveImageToPhone(img, success, error) {
    var canvas, context;
    canvas = document.createElement('canvas');
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
    context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    window.canvas2ImagePlugin.saveImageDataToLibrary(
        success,
        error,
        canvas
    );
}

function checkStoragePermissions(callback) {
    if (device.platform !== 'Android') {
        callback();
        return;
    }

    var permissions = cordova.plugins.permissions;

    var arr = [
        permissions.WRITE_EXTERNAL_STORAGE
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
            alert('Please manually enable storage permissions.');
        }, function() {
            alert('Please manually enable storage permissions.');
        });
    }, function() {
        alert('Please manually enable storage permissions.');
    });
}

app.initialize();

function joinARoom(roomId) {
    // Muaz Khan     - https://github.com/muaz-khan
    // MIT License   - https://www.WebRTC-Experiment.com/licence/
    // Source Code   - https://github.com/muaz-khan/RTCMultiConnection
    var iframe = document.querySelector('iframe');
    var imagePreview = document.querySelector('#image-preview');
    var videoPreview = document.querySelector('#video-preview');

    iframe.onclick = videoPreview.onclick = imagePreview.onclick = function() {
        var element = this;
        document.fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.documentElement.webkitRequestFullScreen;
        if (document.fullscreenEnabled) {
            document.fullScreenedElement = element;

            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }
    };

    var btnSelectFile = document.querySelector('.btn-select-file');
    var btnExitApp = document.querySelector('#exit-app');

    btnSelectFile.onclick = function() {
        var fileSelector = new FileSelector();
        fileSelector.selectSingleFile(function(file) {
            if(!file) return;
            onFileSelected(file);
            previewFile(file);
        });
    };

    var connection;
    var lastSelectedFile;

    var room_id = '';

    // 60k -- assuming receiving client is chrome
    var chunk_size = 60 * 1000;

    function setupWebRTCConnection() {
        if (connection) {
            return;
        }

        // www.RTCMultiConnection.org/docs/
        connection = new RTCMultiConnection();

        connection.autoCloseEntireSession = true;

        // to make sure, "connection-reconnect" doesn't sends files again
        connection.fileReceived = {};

        // by default, socket.io server is assumed to be deployed on your own URL
        // connection.socketURL = '/';

        // comment-out below line if you do not have your own socket.io server
        connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

        connection.socketMessageEvent = 'file-sharing-demo';

        connection.chunkSize = chunk_size;

        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        };

        connection.enableFileSharing = true;

        if (room_id && room_id.length) {
            connection.userid = room_id;
        }

        connection.channel = connection.sessionid = roomId;

        connection.session = {
            data: true,
            // oneway: true --- to make it one-to-many
        };

        connection.filesContainer = logsDiv;

        connection.connectedWith = {};

        connection.onmessage = function(event) {
            if(event.data.doYouWannaReceiveThisFile) {
                if(!connection.fileReceived[event.data.fileName]) {
                    connection.send({
                        yesIWannaReceive:true,
                        fileName: event.data.fileName
                    });
                }
            }

            if(event.data.yesIWannaReceive && !!lastSelectedFile) {
                connection.shareFile(lastSelectedFile, event.userid);
            }
        };

        connection.onopen = function(e) {
            try {
                chrome.power.requestKeepAwake('display');
            }
            catch(e) {}

            if (connection.connectedWith[e.userid]) return;
            connection.connectedWith[e.userid] = true;

            var message = '<b>' + e.userid + '</b><br>is connected.';
            appendLog(message);

            if (!lastSelectedFile) return;

            // already shared the file

            var file = lastSelectedFile;
            setTimeout(function() {
                appendLog('Sharing file<br><b>' + file.name + '</b><br>Size: <b>' + bytesToSize(file.size) + '<b><br>With <b>' + connection.getAllParticipants().length + '</b> users');

                connection.send({
                    doYouWannaReceiveThisFile: true,
                    fileName: file.size + file.name
                });
            }, 500);
        };

        connection.onclose = function(e) {
            incrementOrDecrementUsers();

            if (connection.connectedWith[e.userid]) return;

            appendLog('Data connection has been closed between you and <b>' + e.userid + '</b>. Re-Connecting..');
            connection.join(roomId);
        };

        connection.onerror = function(e) {
            if (connection.connectedWith[e.userid]) return;

            appendLog('Data connection failed. between you and <b>' + e.userid + '</b>. Retrying..');
        };

        setFileProgressBarHandlers(connection);

        connection.onUserStatusChanged = function(user) {
            incrementOrDecrementUsers();
        };

        connection.onleave = function(user) {
            user.status = 'offline';
            connection.onUserStatusChanged(user);
            incrementOrDecrementUsers();
        };

        var message = 'Connecting room: <b>' + connection.channel + '</b>';
        appendLog(message);

        connection.openOrJoin(connection.channel, function(isRoomExists, roomid) {
            var message = 'Successfully connected to room: <b>' + roomid + '</b><hr>Other users can join you on iPhone/Android using "' + roomid + '" or desktop (Windows/MacOSX/Ubuntu) users can join using this (secure/private) URL: <a>webrtcweb.com/fs#' + roomid + '</a>';

            // if (isRoomEists) { }
            appendLog(message);

            if(document.getElementById('room-id')) {
                document.getElementById('room-id').parentNode.innerHTML = 'Joined room: ' + roomid;
            }

            var socket = connection.getSocket();
            socket.on('disconnect', function() {
                appendLog('Seems disconnected.', 'red');
            });
            socket.on('error', function() {
                appendLog('Seems disconnected.', 'red');
            });
            socket.on('connect', function() {
                connection.openOrJoin(connection.channel);
            });
        });

        window.connection = connection;
    }

    function setFileProgressBarHandlers(connection) {
        var progressHelper = {};

        // www.RTCMultiConnection.org/docs/onFileStart/
        connection.onFileStart = function(file) {
            if (connection.fileReceived[file.size + file.name]) return;

            var div = document.createElement('div');
            div.style.borderBottom = '1px solid black';
            div.style.padding = '2px 4px';
            div.id = file.uuid;

            var message = '';
            if (file.userid == connection.userid) {
                message += 'Sharing with:' + file.remoteUserId;
            } else {
                message += 'Receiving from:' + file.userid;
            }

            message += '<br><b>' + file.name + '</b>.';
            message += '<br>Size: <b>' + bytesToSize(file.size) + '</b>';
            message += '<br><label>0%</label> <progress></progress>';
            
            if(file.userid !== connection.userid) {
                message += '<br><button id="resend">Receive Again?</button>';
            }

            div.innerHTML = message;

            connection.filesContainer.insertBefore(div, connection.filesContainer.firstChild);

            if(file.userid !== connection.userid && div.querySelector('#resend')) {
                div.querySelector('#resend').onclick = function(e) {
                    e.preventDefault();
                    this.onclick = function() {};

                    if(connection.fileReceived[file.size + file.name]) {
                        delete connection.fileReceived[file.size + file.name];
                    }
                    connection.send({
                        yesIWannaReceive: true,
                        fileName: file.name
                    }, file.userid);

                    div.parentNode.removeChild(div);
                };
            }

            if (!file.remoteUserId) {
                progressHelper[file.uuid] = {
                    div: div,
                    progress: div.querySelector('progress'),
                    label: div.querySelector('label')
                };
                progressHelper[file.uuid].progress.max = file.maxChunks;
                return;
            }

            if (!progressHelper[file.uuid]) {
                progressHelper[file.uuid] = {};
            }

            progressHelper[file.uuid][file.remoteUserId] = {
                div: div,
                progress: div.querySelector('progress'),
                label: div.querySelector('label')
            };
            progressHelper[file.uuid][file.remoteUserId].progress.max = file.maxChunks;
        };

        // www.RTCMultiConnection.org/docs/onFileProgress/
        connection.onFileProgress = function(chunk) {
            if (connection.fileReceived[chunk.size + chunk.name]) return;

            var helper = progressHelper[chunk.uuid];
            if (!helper) {
                return;
            }
            if (chunk.remoteUserId) {
                helper = progressHelper[chunk.uuid][chunk.remoteUserId];
                if (!helper) {
                    return;
                }
            }

            helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
            updateLabel(helper.progress, helper.label);
        };

        // www.RTCMultiConnection.org/docs/onFileEnd/
        connection.onFileEnd = function(file) {
            if (connection.fileReceived[file.size + file.name]) return;

            var div = document.getElementById(file.uuid);
            if (div) {
                div.parentNode.removeChild(div);
            }

            if (file.remoteUserId === connection.userid) {
                previewFile(file);

                connection.fileReceived[file.size + file.name] = file;

                var message = 'Successfully received file';
                message += '<br><b>' + file.name + '</b>.';
                message += '<br>Size: <b>' + bytesToSize(file.size) + '</b>.';
                message += '<br><a href="' + file.url + '" target="_blank" download="' + file.name + '">Download</a>';
                var div = appendLog(message);

                div.querySelector('a').onclick = function(e) {
                    e.preventDefault();

                    if(div.querySelector('#saving') && div.querySelector('#saving').innerHTML !== 'Saved.') {
                        return;
                    }
                    
                    var span = document.createElement('span');
                    span.style.display = 'block';
                    span.style.color = 'red';
                    span.id = 'saving';
                    span.innerHTML = 'Saving...';
                    div.appendChild(span);

                    app.saveToDisk(file, function(result, file, error) {
                        if(result === 'success') {
                            var span = div.querySelector('#saving');
                            span.innerHTML = 'Saved to SDCard root.';
                            span.style.color = 'green';
                            return;
                        }
                        div.querySelector('#saving').innerHTML = error;
                    });
                };
                return;
            }

            var message = 'Successfully shared file';
            message += '<br><b>' + file.name + '</b>.';
            message += '<br>With: <b>' + file.remoteUserId + '</b>.';
            message += '<br>Size: <b>' + bytesToSize(file.size) + '</b>.';
            appendLog(message);
        };

        function updateLabel(progress, label) {
            if (progress.position === -1) {
                return;
            }

            var position = +progress.position.toFixed(2).split('.')[1] || 100;
            label.innerHTML = position + '%';
        }
    }

    function bytesToSize(bytes) {
        var k = 1000;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) {
            return '0 Bytes';
        }
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    }

    function onFileSelected(file) {
        lastSelectedFile = file;

        if (connection) {
            connection.send({
                doYouWannaReceiveThisFile: true,
                fileName: lastSelectedFile.size + lastSelectedFile.name
            });
        }

        var innerHTML = 'You selected:<br><b>' + lastSelectedFile.name + '</b><br>Size: <b>' + bytesToSize(lastSelectedFile.size) + '</b>';
        appendLog(innerHTML);
    }

    var numberOfUsers = document.getElementById('number-of-users');

    function incrementOrDecrementUsers() {
        numberOfUsers.innerHTML = connection ? connection.getAllParticipants().length : 0;
    }

    var logsDiv = document.getElementById('logs');

    function appendLog(html, color) {
        var div = document.createElement('div');
        div.innerHTML = '<p>' + html + '</p>';
        logsDiv.insertBefore(div, logsDiv.firstChild);

        if(color) {
            div.style.color = color;
        }

        return div;
    }

    appendLog('Live site: <a>webrtcweb.com/fs</a>');

    window.onerror = function() {
        appendLog('Error:<br>' + JSON.stringify(arguments), 'red')
    };

    console.error = function(err) {
        appendLog('Error:<br>' + err, 'red')
    };

    function previewFile(file) {
        btnSelectFile.style.left = '5px';
        btnSelectFile.style.right = 'auto';
        btnSelectFile.style.zIndex = 10;
        btnSelectFile.style.top = '5px';
        btnSelectFile.style.outline = 'none';
        btnExitApp.style.left = ((screen.width/2) - (btnExitApp.clientWidth/2)) + 'px';
        btnExitApp.style.top = 'auto';
        btnExitApp.style.bottom = 0;
        btnExitApp.style.paddingLeft = '15px';
        btnExitApp.style.paddingRight = '15px';

        document.querySelector('.overlay').style.display = 'none';
        
        iframe.style.display = 'none';
        imagePreview.style.display = 'none';
        videoPreview.style.display = 'none';

        iframe.onload = videoPreview.onload = imagePreview.onload = function() {
            if(this != iframe) {
                this.style.width = '100%';
                this.style.height = 'auto';
                return;
            }

            iframe && Array.prototype.slice.call(iframe.contentWindow.document.body.querySelectorAll('*')).forEach(function(element) {
                element.style.maxWidth = '100%';
            });

            if (!file.type || fileNameMatches || file.type.match(/image|video|audio|pdf/g) || iframe.src.indexOf('data:image/png') !== -1) {
                iframe.contentWindow.document.body.style.textAlign = 'center';
                iframe.contentWindow.document.body.style.background = 'black';
                iframe.contentWindow.document.body.style.color = 'white';
                return;
            }
            iframe.contentWindow.document.body.style.textAlign = 'left';
            iframe.contentWindow.document.body.style.background = 'white';
            iframe.contentWindow.document.body.style.color = 'black';
        };

        var fileNameMatches = (file.name || '').match(/.3gp|.mp3|.mp4|.m4a|.m3u8|.ts|.wav|.ogg|.aac|.flac|.mid|.xmf|.mxmf|.rtx|.mkv|.flv|.jpg|.jpeg|.png|.gif|.webp|.bmp|.webm|.txt|.rtf|.doc|docx|.js|.css|.cs/g);
        if (file.type.match(/image/g) || (file.name || '').match(/.jpg|.jpeg|.png|.gif|.webp|.bmp/g)) {
            iframe.style.display = 'none';
            videoPreview.style.display = 'none';
            imagePreview.style.display = 'block';

            imagePreview.src = URL.createObjectURL(file);
        }
        else if (file.type.match(/video|audio/g) || (file.name || '').match(/.3gp|.mp3|.mp4|.m4a|.m3u8|.ts|.wav|.ogg|.aac|.flac|.mid|.xmf|.mxmf|.rtx|.mkv|.flv|.webm/g)) {
            iframe.style.display = 'none';
            imagePreview.style.display = 'none';
            videoPreview.style.display = 'block';

            videoPreview.src = URL.createObjectURL(file);
        }
        else if (file.type.match(/image|video|audio|pdf|txt|javascript|css|php|py/g) || fileNameMatches) {
            imagePreview.style.display = 'none';
            videoPreview.style.display = 'none';
            iframe.style.display = 'block';
            
            iframe.src = URL.createObjectURL(file);
        } else {
            iframe.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUUAAADQCAMAAACndoMrAAAABGdBTUEAALGPC/xhBQAAAwBQTFRFAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkKCgoLCwsMDAwNDQ0ODg4PDw8QEBARERESEhITExMUFBQVFRUWFhYXFxcYGBgZGRkaGhobGxscHBwdHR0eHh4fHx8f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAxdBzUgAAAQB0Uk5T////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AFP3ByUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTJDBGvsAAAaVElEQVR4Xu1dCVfqPBCdsgmKioqIgFgRtSoqIMoiS///n/KbJV2gRQoUz/Nrc56vFNJpcjO5mSSTBL7jsD0CYIuo5L8BIP5bA4N8RaGnUHzJI4JxWB+B/AsBqVDEx834byMMbBTPEMBUtT0247AOAuN2NYXInSldJC2MIVwHQCvumGowo/iCH2qbiIifQQRqiN4LoogNS4zHFggA5EkdIRVX581RHBM3flfArG4uI34S0UMUsUK3Yyy2QKAtDQzEFXoLEM2x6vJtIyN+lo2duIXeWhGk6721mGgLULwYbRC2zn3Mi1tDiAJiXgwDRbIXY17cFsmYF7dFkJ6PeTE8FMOQFGkZMS+GUPwxL4YAYsyLYYAY24uhoPiH7MXJaJ0cD2eBYo97X1a86TDQE36R/hAv5qATPJsNuHRFnvUmvo+OCpj/d7PPgk/g0RtJz94FeOmivTjK5fry2HP2QL36LXsSQNLPUe5yR4bE6Oyfq6jt6nFKOyjx9/WsE4r+orLrjMjrUHZJqUHeV2YRtNLp+1cC7vHnAqgUuqOW5+Qsy6OnH52GpsQt4fygfKrB9ijmALRPlmZAlq+zugaQSNCkOFbVIl6tkNsCxTtd6v08ihV/FEfA6v2lcZ63QNHDixdwKpnIAKg5rTzcLiuEwN9nIQGiYxaK6I5x3ZvNeroGOcVh81lflB1IF61I86LGHV9OfYcEv6TXnm6HoocXHyFJIs1P/EWUAktMVfLAmHkjZgEnv5l+FIpt0J4k2mvCqko7Q3FJwp9VtZCft9BFTz/6S00I3kNZgwFJf1Jo9h+qt2/zLV//SdffBGrjqnL7yh+nxps5bdcbc21BFowiFFwoFsCi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';
        }
    }

    setupWebRTCConnection();
}
