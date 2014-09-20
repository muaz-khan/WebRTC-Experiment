// ui-handler for AndroidRTC app
function searchInDOM(selector) {
    return document.querySelector(selector);
}

function getFromLocalStorage(key) {
    return localStorage.getItem(key);
}

function putIntoLocalStorage(key, value) {
    return localStorage.setItem(key, value);
}

window.addEventListener('DOMContentLoaded', function() {
    // buttons
    var btnSendChatMessage = searchInDOM('.send-chat-message');
    var btnSearchUser = searchInDOM('.search-user');
    var btnSettings = searchInDOM('.setttings');

    // input boxes
    var chatInputBox = searchInDOM('.chat-input textarea');
    var inputSearchFriends = searchInDOM('#search-friends');

    var messageSound = document.getElementById('message-sound');

    // containers
    var conversationPanel = searchInDOM('.conversation-panel');

    // Conversation.js
    window.user = new User();

    // a custom method used to append a new DIV into DOM
    appendConversation({
        username: 'Welcome',
        message: 'Your username is: <input type="text" style="width:auto" value="' + user.username + '"> You can modify & share it with your friends.',
        callback: function(parent) {
            parent.querySelector('input[type=text]').onkeyup = function() {
                user.username = this.value;
            };
        }
    });

    // these are RTCMultiConnection.js defaults
    // RTCMultiConnection.js is big-javascript library
    // RTCMultiConnection provides tons of WebRTC features!
    // read more here: www.RTCMultiConnection.org/docs/
    user.defaults = {
        log: false, // for production use only.
        trickleIce: true, // for SIP/XMPP and XHR
        getExternalIceServers: false, // ice-servers from xirsys.com
        leaveOnPageUnload: true,
        /*iceServers: [{
            url: 'stun:stun.l.google.com:19302'
        }],*/
        iceProtocols: {
            tcp: true,
            udp: true
        },
        candidates: {
            host: true, // local/host candidates
            reflexive: true, // STUN candidates
            relay: true // TURN candidates
        },
        autoReDialOnFailure: true, // renegotiation will not work if it is true
        body: document.getElementById('media-container')
    };

    // optional method to display the logs
    user.on('log', function(message) {
        console.log(message);
        appendConversation({
            username: 'Dev-Logs',
            message: message.replace(/\\r\\n/g, '<br />')
        });
    });

    // "signaler" object is defined in "common-signaling.js"
    // this method connects users to signaling-channel
    // so that user can call/search/invite any other user
    // also, other users can search him.
    signaler.connect(user);

    if (getFromLocalStorage('username')) {
        user.username = localStorage.getItem('username');
    } else putIntoLocalStorage('username', user.username);

    user.on('conversation-opened', function(conversation) {
        conversation.emit('message', 'Hey ' + conversation.targetuser + ', conversation has been opened between you and ' + user.username + '.');
        conversation.on('message', function(event) {
            appendConversation({
                username: event.username,
                message: event.data
            });
            messageSound.play();
        });
        conversation.on('stream', function(stream) {
            user.emit('--log', 'stream: ' + stream.streamid);

            conversation.peer.body.insertBefore(stream.mediaElement, conversation.peer.body.firstChild);

            btnSettings.style.display = 'none';
            mediaPanel.style.display = 'block';
        });

        conversation.on('add-file', function(file) {
            appendConversation({
                username: 'File',
                message: file.sender + ' added a file: "' + file.name + '". <button id="download">Download</button><button id="cancel">Cancel</button>',
                callback: function(parent) {
                    parent.id = file.uuid;

                    parent.querySelector('#download').onclick = function() {
                        file.download();
                        disableBoth();
                    };
                    parent.querySelector('#cancel').onclick = function() {
                        file.cancel();
                        disableBoth();
                    };

                    function disableBoth() {
                        parent.querySelector('#download').disabled = true;
                        parent.querySelector('#cancel').disabled = true;
                    }
                }
            });
        });

        conversation.on('file-downloaded', function(file) {
            var parent = document.getElementById(file.uuid);
            if (!parent) return;

            parent.querySelector('.message').innerHTML = file.sender + ' shared a file which is downloaded in the application: "' + file.name + '". <button id="save-to-disk">Save To Disk</button>';
            parent.querySelector('#save-to-disk').onclick = function() {
                file.savetodisk();
                this.disabled = true;
            };
        });

        conversation.on('file-cancelled', function(file) {
            appendConversation({
                username: 'Cancelled',
                message: conversation.targetuser + ' cancelled your file: "' + file.name + '".'
            });
        });

        conversation.on('file-sent', function(file) {
            appendConversation({
                username: 'Sent',
                message: conversation.targetuser + ' received your file: "' + file.name + '".'
            });
        });

        conversation.on('file-progress', function(progress) {
            var parent = document.getElementById(progress.uuid);
            if (!parent || !parent.querySelector('#download')) return;

            parent.querySelector('#download').innerHTML = 'File progress percentage: ' + progress.percentage;
        });
    });

    // button used to search & invite a user
    btnSearchUser.onclick = function() {
        if (isWhiteSpace(inputSearchFriends.value)) return;
        user.emit('search', inputSearchFriends.value);
        inputSearchFriends.value = '';
    };

    inputSearchFriends.onkeyup = function(e) {
        if (e.keyCode == 13) btnSearchUser.onclick();
    };

    // this event is fired if a user is detected by search-agent.
    user.on('search', function(result) {
        appendConversation({
            username: 'System',
            message: result.username + ' is online. Inviting him for chat.'
        });

        // currently the only method to open conversation
        // between two users
        user.openconversationwith(result.username);
    });

    btnSendChatMessage.onclick = function() {
        if (isWhiteSpace(chatInputBox.value)) return;
        user.peers.emit('message', chatInputBox.value);
        appendConversation({
            username: user.username,
            message: chatInputBox.value
        });
        chatInputBox.value = '';
    };

    chatInputBox.onkeyup = function(e) {
        if (e.keyCode != 13) return;
        btnSendChatMessage.onclick();
    };

    var mediaPanel = document.querySelector('.media-panel');
    btnSettings.onclick = function() {
        btnSettings.style.display = 'none';
        mediaPanel.style.display = 'block';
    };

    document.querySelector('#hide-section').onclick = function() {
        btnSettings.style.display = 'inline';
        mediaPanel.style.display = 'none';
    };

    var btnEnableMicrophone = document.querySelector('.microphone');
    btnEnableMicrophone.onclick = function() {
        btnEnableMicrophone.style.display = 'none';
        user.peers.emit('enable', 'microphone');
    };

    var btnEnableCamera = document.querySelector('.camera');
    btnEnableCamera.onclick = function() {
        btnEnableCamera.style.display = 'none';
        user.peers.emit('enable', 'camera');
    };

    var btnShareFiles = document.querySelector('.share-files');
    btnShareFiles.onclick = function() {
        var fileSelector = new FileSelector();
        fileSelector.selectSingleFile(function(file) {
            user.peers.emit('add-file', file);
        });
    };

    function isWhiteSpace(str) {
        return str.replace(/^\s+|\s+$/g, '').length <= 0;
    }

    function appendConversation(args) {
        var conversation = document.createElement('div');
        conversation.className = 'conversation';

        var activistName = document.createElement('div');
        activistName.className = 'activist-name';
        conversation.appendChild(activistName);

        var symbol = document.createElement('div');
        symbol.className = 'symbol';
        symbol.innerHTML = args.username.split('')[0].toUpperCase();
        activistName.appendChild(symbol);

        var fullName = document.createElement('div');
        fullName.className = 'full-name';
        fullName.innerHTML = args.username;
        activistName.appendChild(fullName);

        var message = document.createElement('div');
        message.className = 'message';
        message.innerHTML = args.message;
        conversation.appendChild(message);

        var messageDate = document.createElement('div');
        messageDate.className = 'message-date';
        messageDate.innerHTML = getCurrentTime();
        message.appendChild(messageDate);

        conversationPanel.insertBefore(conversation, conversationPanel.firstChild);

        if (args.callback) args.callback(conversation);
    }

    function getCurrentTime() {
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        if (hours.toString().length == 1) hours = '0' + hours;
        if (minutes.toString().length == 1) minutes = '0' + minutes;
        if (seconds.toString().length == 1) seconds = '0' + seconds;

        return hours + ':' + minutes + ':' + seconds;
    }
}, false);
