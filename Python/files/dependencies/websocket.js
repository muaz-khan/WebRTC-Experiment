(function(){

// ---------------------------------------------------------------------------
// WEBSOCKET INTERFACE
// ---------------------------------------------------------------------------
WebSocket = function( url, protocols ) {
    var self     = this
    ,   url      = self.url      = url || ''
    ,   protocol = self.protocol = protocols || 'Sec-WebSocket-Protocol'
    ,   bits     = url.split('/')
    ,   setup    = {
         ssl           : bits[0] === 'wss:'
        ,origin        : bits[2]
        ,publish_key   : bits[3]
        ,subscribe_key : bits[4]
        ,channel       : bits[5]
    };

    // READY STATES
    self.CONNECTING = 0; // The connection is not yet open.
    self.OPEN       = 1; // The connection is open and ready to communicate.
    self.CLOSING    = 2; // The connection is in the process of closing.
    self.CLOSED     = 3; // The connection is closed or couldn't be opened.

    // CLOSE STATES
    self.CLOSE_NORMAL         = 1000; // Normal Intended Close; completed.
    self.CLOSE_GOING_AWAY     = 1001; // Closed Unexpecttedly.
    self.CLOSE_PROTOCOL_ERROR = 1002; // Server: Not Supported.
    self.CLOSE_UNSUPPORTED    = 1003; // Server: Unsupported Protocol.
    self.CLOSE_TOO_LARGE      = 1004; // Server: Too Much Data.
    self.CLOSE_NO_STATUS      = 1005; // Server: No reason.
    self.CLOSE_ABNORMAL       = 1006; // Abnormal Disconnect.

    // Events Default
    self.onclose   = self.onerror = 
    self.onmessage = self.onopen  = function(){};
    self.onsend    =  function(){};

    // Attributes
    self.binaryType     = '';
    self.extensions     = '';
    self.bufferedAmount = 0;
    self.trasnmitting   = false;
    self.buffer         = [];
    self.readyState     = self.CONNECTING;

    // Close if no setup.
    if (!url) {
        self.readyState = self.CLOSED;
        self.onclose({
            code     : self.CLOSE_ABNORMAL,
            reason   : 'Missing URL',
            wasClean : true
        });
        return self;
    }

    // PubNub WebSocket Emulation
    self.pubnub       = PUBNUB.init(setup);
    self.pubnub.setup = setup;
    self.setup        = setup;

    self.pubnub.subscribe({
        restore    : false,
        channel    : setup.channel,
        disconnect : self.onerror,
        reconnect  : self.onopen,
        error      : function() {
            self.onclose({
                code     : self.CLOSE_ABNORMAL,
                reason   : 'Missing URL',
                wasClean : false
            });
        },
        callback   : function(message) {
            self.onmessage({ data : message });
        },
        connect    : function() {
            self.readyState = self.OPEN;
            self.onopen();
        }
    });
};

// ---------------------------------------------------------------------------
// WEBSOCKET SEND
// ---------------------------------------------------------------------------
var buffer  = []
,   sending = 0;

function stream(socket) {
/*
    var socket = buffer.pop();

    if (socket.buffer.length) {
        socket.pubnub.publish(deliverable);
    }
    else {
        sending = 0;
    }
*/
}

WebSocket.prototype.send = function(data) {
    var self = this;

    buffer.push({
        channel  : self.setup.channel,
        message  : data,
        callback : function(response) {
            self.onsend({ data : response });
            stream();
        }
    });

    /*
    if (!sending) {
        sending = 1;
        stream(socket);
    }
    */
    self.pubnub.publish({
        channel  : self.pubnub.setup.channel,
        message  : data,
        callback : function(response) {
            self.onsend({ data : response });
        }
    });
};

// ---------------------------------------------------------------------------
// WEBSOCKET CLOSE
// ---------------------------------------------------------------------------
WebSocket.prototype.close = function() {
    var self = this;
    self.pubnub.unsubscribe({ channel : self.pubnub.setup.channel });
    self.readyState = self.CLOSED;
    self.onclose({});
};


})();
