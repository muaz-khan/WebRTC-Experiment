chrome.runtime.onConnect.addListener(function(port) {
    runtimePort = port;

    runtimePort.onMessage.addListener(function(message) {
        if (!message || !message.messageFromContentScript1234) {
            return;
        }

        if (message.startSharing || message.stopSharing) {
            captureDesktop();
        }

        if(message.openChat) {
            if(connection) {
                connection.send({
                    openChat: true
                });
            }
        }

        if(message.closeChat) {
            if(connection) {
                connection.send({
                    closeChat: true
                });
            }
        }

        if(message.newChatMessage) {
            if(connection) {
                connection.send({
                    newChatMessage: message.newChatMessage
                });
            }
        }
    });
});
