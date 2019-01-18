var txtChatMessage = document.getElementById('txt-chat-message');
var chatMessages = document.getElementById('chat-messages');

var port = chrome.runtime.connect();

txtChatMessage.onkeyup = function(e) {
    if(e.keyCode === 13) {
        var checkmark_id = (Math.random()*100).toString().replace('.', '');
        appendChatMessage('You', this.value, checkmark_id);
        port.postMessage({
            messageFromContentScript1234: true,
            newChatMessage: this.value,
            checkmark_id: checkmark_id
        });
        this.value = '';
    }
};

function appendChatMessage(name, message, checkmark_id) {
    var div = document.createElement('div');
    if(checkmark_id) {
        div.innerHTML = '<p><span class="name">' + name + ': <img class="checkmark" id="' + checkmark_id + '" title="Received" src="../images/checkmark.png"></span></p><p>' + message + '</p>';
    }
    else {
        div.innerHTML = '<p><span class="name">' + name + ':</span></p><p>' + message + '</p>';
    }
    chatMessages.appendChild(div);

    chatMessages.scrollTop = chatMessages.clientHeight;
    chatMessages.scrollTop = chatMessages.scrollHeight - chatMessages.scrollTop;
}

port.onMessage.addListener(function(message) {
    if (!message || !message.messageFromContentScript1234) {
        return;
    }

    if(message.newChatMessage) {
        appendChatMessage('Viewer', message.newChatMessage);
    }

    if(message.receivedChatMessage) {
        if(document.getElementById(message.checkmark_id)) {
            document.getElementById(message.checkmark_id).style.display = '';
        }
    }
});

window.onbeforeunload = function() {
    port.postMessage({
        messageFromContentScript1234: true,
        closeChat: true
    });
};
