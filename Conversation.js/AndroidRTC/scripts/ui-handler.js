// header bar
// small icon on header bar --- 24*24
// gray background of header bar
// + button to add friends
// search box and online users should appear only when + button is cliked
// settings dots....
// settings button should display context menu

// whie background of the main page.
// all users are listed in the left bar
// conversation panel should appear at right side === opaciy==.7
// when user from left-panel is select; scroll conversation panel to left to overlap the screen.
// use small input box or set small height for <textarea>
// left-icon explaing chat-icon
// placeholder="Send Chat Message"
// attachment icon....
// show text-send icon only when text is entered.
// show video icon, audio icon on <header> bar when a user is selected.



function searchInDOM(selector) {
    return document.querySelector(selector);
};

function getFromLocalStorage(key) {
    return localStorage.getItem(key);
}

function putIntoLocalStorage(key, value) {
    return localStorage.setItem(key, value);
}

window.addEventListener('DOMContentLoaded', function () {
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
    var user = new User();
    
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
        log: true, // for production use only.
        trickleIce: true, // for SIP/XMPP and XHR
        getExternalIceServers: true, // ice-servers from xirsys.com
        leaveOnPageUnload: true,
        /*iceServers: [{
            url: 'stun:stun.l.google.com:19302'
        }],*/
        iceProtocols: {
            tcp: true,
            udp: true
        },
        candidates: {
            host: true,      // local/host candidates
            reflexive: true, // STUN candidates
            relay: true      // TURN candidates
        },
        autoReDialOnFailure: false, // renegotiation will not work if it is true
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
    }
    else putIntoLocalStorage('username', user.username);

    user.on('conversation-opened', function (conversation) {
        conversation.emit('message', 'Hey ' + conversation.targetuser + ', conversation has been opened between you and ' + user.username + '.');
        conversation.on('message', function(event) {
            appendConversation({
                username: event.username,
                message: event.data
            });
            
            messageSound.play();
        });
    });
    
    // button used to search & invite a user
    btnSearchUser.onclick = function() {
        if(isWhiteSpace(inputSearchFriends.value)) return;
        user.emit('search', inputSearchFriends.value);
        inputSearchFriends.value = '';
    };
    
    inputSearchFriends.onkeyup = function(e) {
        if(e.keyCode == 13) btnSearchUser.onclick();
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
        if(isWhiteSpace(chatInputBox.value)) return;
        user.peers.emit('message', chatInputBox.value);
        appendConversation({
            username: user.username,
            message: chatInputBox.value
        });
        chatInputBox.value = '';
    };
    
    chatInputBox.onkeyup = function(e) {
        if(e.keyCode != 13) return;
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
        
        if(args.callback) args.callback(conversation);
    }

    function getCurrentTime() {
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        
        if(hours.length == 1) hours = '0' + hours;
        if(minutes.length == 1) minutes = '0' + minutes;
        if(seconds.length == 1) seconds = '0' + seconds;
        
        return hours + ':' + minutes + ':' + seconds;
    }
}, false);
