// Muaz Khan    - www.MuazKhan.com
// MIT License  - www.WebRTC-Experiment.com/licence
// Source Code  - https://github.com/muaz-khan/FileBufferReader

// _________
// PeerUI.js

window.addEventListener('load', function() {
    var setupOffer = document.getElementById('setup-offer'),
        innerHTML;

    var SIGNALING_URI = 'wss://webrtc-signaling.herokuapp.com:443/ws/';

    var channel = location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');

    if (location.hash && location.hash.length > 2) {
        channel = location.hash.replace('#', '');
    }

    var websocket = new WebSocket(SIGNALING_URI);
    websocket.onopen = function() {
        var innerHTML = '<span>Setup</span> <span>WebRTC Connection</span>';
        setupOffer.innerHTML = innerHTML;
        setupOffer.disabled = false;

        websocket.push(JSON.stringify({
            open: true,
            channel: channel
        }));

        var info = document.getElementById('info');
        if (location.hash.length > 2) {
            document.getElementById('share-this-link').innerHTML = '<a href="' + location.href + '" target="_blank">Share this link with other users!</a>';
            info.innerHTML = 'Your UNIQUE room-id is: ' + location.hash.replace('#', '') + '. Open <a href="' + location.href + '" target="_blank">same URL</a> on a new window or tab.';
            info.style.display = 'block';
        }
    };
    websocket.push = websocket.send;
    websocket.send = function(data) {
        if (websocket.readyState != 1) {
            console.warn('websocket connection is not opened yet.');
            return setTimeout(function() {
                websocket.send(data);
            }, 1000);
        }

        websocket.push(JSON.stringify({
            data: data,
            channel: channel
        }));
    };

    var progressHelper = {};
    var outputPanel = document.querySelector('.output-panel');

    function previewFile(file) {
        try {
            file.url = URL.createObjectURL(fileSelector.lastSelectedFile || file);
        } catch (e) {
            return;
        }

        var html = '<a class="single-line-text" href="' + file.url + '" target="_blank" download="' + file.name + '">Download <span class="highlighted-name">' + file.name + '</span> on your Disk!</a>';

        if (file.name.match(/\.jpg|\.png|\.jpeg|\.gif/gi)) {
            html += '<img crossOrigin="anonymous" src="' + file.url + '">';
        } else if (file.name.match(/\.wav|\.mp3/gi)) {
            html += '<audio src="' + file.url + '" controls></audio>';
        } else if (file.name.match(/\.webm|\.flv|\.mp4/gi)) {
            html += '<video src="' + file.url + '" controls></video>';
        } else if (file.name.match(/\.pdf|\.js|\.txt|\.sh/gi)) {
            html += '<a href="' + file.url + '" target="_blank" download="' + file.name + '">';
            html += '<br><iframe class="inline-iframe" src="' + file.url + '"></iframe></a>';
        }

        progressHelper[file.uuid].li.innerHTML = html;

        fileSelector.lastSelectedFile = false;
    }

    var FileHelper = {
        onBegin: function(file) {
            var li = document.createElement('li');
            li.innerHTML = '<pre style="text-align:left;" class="file-name">' + file.name + '</pre><br><progress style="display:none;" value="0"></progress><div class="circular-progress-bar c100 p25" style="margin-left: 40%;"><span class="circular-progress-bar-percentage">25%</span><div class="slice"><div class="bar"></div><div class="fill"></div></div></div>';
            li.style['min-height'] = '350px';
            outputPanel.insertBefore(li, outputPanel.firstChild);
            progressHelper[file.uuid] = {
                li: li,
                progress: li.querySelector('progress'),
                label: li.querySelector('label')
            };
            progressHelper[file.uuid].progress.max = file.maxChunks;

            btnSelectFile.disabled = true;

            if (fileSelector.lastSelectedFile) {
                btnSelectFile.innerHTML = 'File Sending In-Progress...';
            } else {
                btnSelectFile.innerHTML = 'File Receiving In-Progress...';
            }

            resetTimeCalculator();
            timeCalculator(progressHelper[file.uuid].progress);

            progressHelper.lastFileUUID = file.uuid;
        },
        onEnd: function(file) {
            previewFile(file);

            btnSelectFile.innerHTML = 'Select or Drop a File';
            if (peerConnection.isOpened) {
                btnSelectFile.disabled = false;
            }

            progressHelper.lastFileUUID = null;
        },
        onProgress: function(chunk) {
            var helper = progressHelper[chunk.uuid];
            helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;

            if (helper.progress.position > 0 && helper.li.querySelector('.circular-progress-bar-percentage')) {
                var position = +helper.progress.position.toFixed(2).split('.')[1] || 100;
                helper.li.querySelector('.circular-progress-bar-percentage').innerHTML = position + '%';
                helper.li.querySelector('.circular-progress-bar').className = 'circular-progress-bar c100 p' + position;
            }

            if (chunk.currentPosition + 2 != chunk.maxChunks && helper.li.querySelector('.file-name')) {
                progressHelper[chunk.uuid].lastChunk = chunk;
                progressHelper.callback = function(timeRemaining) {
                    var lastChunk = progressHelper[chunk.uuid].lastChunk;

                    var singleChunkSize = chunk.size / lastChunk.maxChunks;

                    var html = 'File name: ' + lastChunk.name + ' (File size: ' + bytesToSize(chunk.size) + ')';
                    html += '<br>Pieces (total/remaining): ' + lastChunk.maxChunks + '/' + lastChunk.currentPosition;
                    html += ' (Single piece size: ' + bytesToSize(singleChunkSize) + ')';

                    var endedAt = (new Date).getTime();
                    var timeElapsed = endedAt - (progressHelper.startedAt || (new Date).getTime());

                    progressHelper.latencies.push(timeElapsed);
                    var avg = calculateAverage(progressHelper.latencies);

                    html += '<br>Latency in millseconds: <span title="' + millsecondsToSeconds(timeElapsed) + ' seconds">' + timeElapsed + '</span> (Average): <span title="' + millsecondsToSeconds(avg) + ' seconds">' + avg + '</span>';

                    var remainingFileSize = singleChunkSize * (lastChunk.maxChunks - lastChunk.currentPosition);
                    html += '<br>Remaining (time): ' + timeRemaining + ' (Remaining file size): ' + bytesToSize(remainingFileSize);

                    helper.li.querySelector('.file-name').innerHTML = html;

                    progressHelper.startedAt = (new Date).getTime();
                };
            } else {
                btnSelectFile.innerHTML = 'Select or Drop a File';

                if (peerConnection.isOpened) {
                    btnSelectFile.disabled = false;
                }
            }
        }
    };

    // RTCPeerConection
    // ----------------
    var peerConnection = new PeerConnection(websocket);

    peerConnection.onuserfound = function(userid) {
        setupOffer.innerHTML = 'Detecting other users...';
        setupOffer.disabled = true;

        peerConnection.sendParticipationRequest(userid);
    };

    peerConnection.onopen = function() {
        peerConnection.isOpened = true;

        innerHTML = '<span>PeerConnection</span> <span>is established.</span>';
        setupOffer.innerHTML = innerHTML;
        setupOffer.disabled = true;

        btnSelectFile.disabled = false;
        btnSelectFile.innerHTML = 'Select or Drop a File';
    };

    peerConnection.onclose = function() {
        onCloseOrOnError('<span>PeerConnection</span> <span>is closed.</span>');
        resetButtons();

        peerConnection.isOpened = false;

        var helper = progressHelper[progressHelper.lastFileUUID];
        if (helper && helper.li && helper.li.parentNode) {
            isStoppedTimer = true;
            helper.li.parentNode.removeChild(helper.li);
        }
    };

    function resetButtons() {
        btnSelectFile.innerHTML = 'Select or Drop a File';
        btnSelectFile.disabled = true;

        setupOffer.disabled = false;
        setupOffer.innerHTML = 'Setup WebRTC Connection';
    }

    peerConnection.onerror = function() {
        onCloseOrOnError('<span>Something</span> <span>went wrong.</span>');
        resetButtons();
    };

    // getNextChunkCallback gets next available buffer
    // you need to send that buffer using WebRTC data channels
    function getNextChunkCallback(nextChunk, isLastChunk) {
        if (isLastChunk) {
            // alert('File Successfully sent.');
        }

        // sending using WebRTC data channels
        peerConnection.send(nextChunk);
    };

    peerConnection.ondata = function(chunk) {
        if (chunk instanceof ArrayBuffer || chunk instanceof DataView) {
            // array buffers are passed using WebRTC data channels
            // need to convert data back into JavaScript objects

            fileBufferReader.convertToObject(chunk, function(object) {
                peerConnection.ondata(object);
            });
            return;
        }

        // if target user requested next chunk
        if (chunk.readyForNextChunk) {
            fileBufferReader.getNextChunk(chunk /*aka metadata*/ , getNextChunkCallback);
            return;
        }

        // if any of the chunks missed
        if (chunk.chunkMissing) {
            fileBufferReader.chunkMissing(chunk);
            return;
        }

        // if chunk is received
        fileBufferReader.addChunk(chunk, function(promptNextChunk) {
            // request next chunk
            peerConnection.send(promptNextChunk);
        });
    };

    var progressIterations = 0;
    var ONE_SECOND = 1000;

    function resetTimeCalculator() {
        progressIterations = 0;
        isStoppedTimer = false;
        progressHelper.callback = function() {};
        progressHelper.latencies = [];
    }

    function calculateAverage(arr) {
        var sum = 0;
        for (var i = 0; i < arr.length; i++) {
            sum += parseInt(arr[i], 10); //don't forget to add the base
        }

        var avg = sum / arr.length;
        return avg.toFixed(1);
    }

    var isStoppedTimer = false;

    // https://github.com/23/resumable.js/issues/168#issuecomment-65297110
    function timeCalculator(progress, selfInvoker) {
        if (isStoppedTimer) return;

        var step = 1;

        var remainingProgress = 1.0 - progress.position;

        var estimatedCompletionTime = Math.round((remainingProgress / progress.position) * progressIterations);
        var estimatedHours, estimatedMinutes, estimatedSeconds, displayHours, displayMinutes, displaySeconds;
        progressIterations += step;

        if (progress.position < 1.0) {
            if (isFinite(estimatedCompletionTime)) {
                estimatedHours = Math.floor(estimatedCompletionTime / 3600);
                displayHours = estimatedHours > 9 ? estimatedHours : '0' + estimatedHours;
                estimatedMinutes = Math.floor((estimatedCompletionTime / 60) % 60);
                displayMinutes = estimatedMinutes > 9 ? estimatedMinutes : '0' + estimatedMinutes;
                estimatedSeconds = estimatedCompletionTime % 60;
                displaySeconds = estimatedSeconds > 9 ? estimatedSeconds : '0' + estimatedSeconds;
            }

            var output = '';
            if (displayHours > 0) {
                output += displayHours + ' hours ';
            }
            if (displayMinutes > 0) {
                output += displayMinutes + ' minutes ';
            }
            if (displaySeconds > 0) {
                output += displaySeconds + ' seconds ';
            }
            if (output.length) {
                progressHelper.callback(output);
            }
        }

        setTimeout(function() {
            timeCalculator(progress, true);
        }, step * ONE_SECOND);
    }

    // -------------------------
    // using FileBufferReader.js

    var fileSelector = new FileSelector();

    // you can force specific files e.g.
    // image/png, image/*, image/jpeg, video/webm, audio/ogg etc.
    fileSelector.accept = '*.*';

    var fileBufferReader = new FileBufferReader();

    fileBufferReader.chunkSize = 60 * 1000; // 60k

    fileBufferReader.onBegin = FileHelper.onBegin;
    fileBufferReader.onProgress = FileHelper.onProgress;
    fileBufferReader.onEnd = FileHelper.onEnd;

    function onFileSelected(file) {
        fileSelector.lastSelectedFile = file;

        btnSelectFile.innerHTML = 'Please wait..';;
        btnSelectFile.disabled = true;

        fileBufferReader.readAsArrayBuffer(file, function(metadata) {
            fileBufferReader.getNextChunk(metadata, getNextChunkCallback);
        }, {
            chunkSize: fileBufferReader.chunkSize
        });

        setTimeout(function() {
            if (fileSelector.lastSelectedFile) return;
            btnSelectFile.innerHTML = 'Select or Drop a File';
            btnSelectFile.disabled = false;
        }, 5000);
    }

    var btnSelectFile = document.getElementById('select-file');
    btnSelectFile.onclick = function() {
        btnSelectFile.disabled = true;
        fileSelector.selectSingleFile(function(file) {
            onFileSelected(file);
        });
    };

    // drag-drop support
    function onDragOver() {
        mainContainer.style.border = '7px solid #98a90f';
        mainContainer.style.background = '#ffff13';
        mainContainer.style.borderRadisu = '16px';
    }

    function onDragLeave() {
        mainContainer.style.border = '1px solid rgb(189, 189, 189)';
        mainContainer.style.background = 'transparent';
        mainContainer.style.borderRadisu = 0;
    }

    var mainContainer = document.getElementById('main-container');
    document.addEventListener('dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!peerConnection || !peerConnection.isOpened) return;

        e.dataTransfer.dropEffect = 'copy';
        onDragOver();
    }, false);

    document.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!peerConnection || !peerConnection.isOpened) return;

        e.dataTransfer.dropEffect = 'copy';
        onDragLeave();
    }, false);

    document.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!peerConnection || !peerConnection.isOpened) return;

        e.dataTransfer.dropEffect = 'copy';
        onDragOver();
    }, false);

    document.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!peerConnection || !peerConnection.isOpened) return;

        onDragLeave();

        if (!e.dataTransfer.files || !e.dataTransfer.files.length) {
            return;
        }

        var file = e.dataTransfer.files[0];

        if (!peerConnection || !peerConnection.isOpened) {
            alert('Pleas setup WebRTC connection before sharing this file.');
            return;
        }

        onFileSelected(file);
    }, false);

    // --------------------------------------------------------
    setupOffer.onclick = function(event) {
        if (event !== true) {
            peerConnection.startBroadcasting();
        }

        setupOffer.innerHTML = 'Detecting other users in this room...';
        setupOffer.disabled = true;

        setTimeout(function() {
            if (!peerConnection.isOpened) {
                var innerHTML = 'I am alone in this room.';
                setupOffer.innerHTML = innerHTML;
                setTimeout(function() {
                    setupOffer.onclick(true);
                }, 2000);
            }
        }, 5 * 1000);
    };

    function onCloseOrOnError(_innerHTML) {
        innerHTML = _innerHTML;
        setupOffer.innerHTML = innerHTML;
        setupOffer.disabled = false;
        setupOffer.className = 'button';

        setTimeout(function() {
            innerHTML = '<span>Setup</span> <span>WebRTC Connection</span>';
            setupOffer.innerHTML = innerHTML;
            setupOffer.disabled = false;
        }, 1000);

        document.getElementById('select-file').disabled = true;
    }

    function millsecondsToSeconds(millis) {
        var seconds = ((millis % 60000) / 1000).toFixed(1);
        return seconds;
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

    function getToken() {
        if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
            var a = window.crypto.getRandomValues(new Uint32Array(3)),
                token = '';
            for (var i = 0, l = a.length; i < l; i++) {
                token += a[i].toString(36);
            }
            return token;
        } else {
            return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
        }
    }
}, false);
