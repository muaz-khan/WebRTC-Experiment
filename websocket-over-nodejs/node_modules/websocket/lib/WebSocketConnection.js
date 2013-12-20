/************************************************************************
 *  Copyright 2010-2011 Worlize Inc.
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *      http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ***********************************************************************/

var crypto = require('crypto');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var WebSocketFrame = require('./WebSocketFrame');
var BufferList = require('../vendor/FastBufferList');
var Constants = require('./Constants');
var Validation = require('./Validation').Validation;

const STATE_OPEN = "open";
const STATE_CLOSING = "closing";
const STATE_CLOSED = "closed";

function WebSocketConnection(socket, extensions, protocol, maskOutgoingPackets, config) {
    this.config = config;
    this.socket = socket;
    this.protocol = protocol;
    this.extensions = extensions;
    this.remoteAddress = socket.remoteAddress;
    this.closeReasonCode = -1;
    this.closeDescription = null;
    
    // We have to mask outgoing packets if we're acting as a WebSocket client.
    this.maskOutgoingPackets = maskOutgoingPackets;
    
    // We re-use the same buffers for the mask and frame header for all frames
    // received on each connection to avoid a small memory allocation for each
    // frame.
    this.maskBytes = new Buffer(4);
    this.frameHeader = new Buffer(10);
    
    // the BufferList will handle the data streaming in
    this.bufferList = new BufferList();
    
    // Prepare for receiving first frame
    this.currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    this.fragmentationSize = 0; // data received so far...
    this.frameQueue = [];
    
    // Various bits of connection state
    this.connected = true;
    this.state = STATE_OPEN;
    this.waitingForCloseResponse = false;
    
    this.closeTimeout = this.config.closeTimeout;
    this.assembleFragments = this.config.assembleFragments;
    this.maxReceivedMessageSize = this.config.maxReceivedMessageSize;

    // The HTTP Client seems to subscribe to socket error events
    // and re-dispatch them in such a way that doesn't make sense
    // for users of our client, so we want to make sure nobody
    // else is listening for error events on the socket besides us.
    this.socket.removeAllListeners('error');

    this.socket.on('error', this.handleSocketError.bind(this));
    this.socket.on('data', this.handleSocketData.bind(this));
    this.socket.on('end', this.handleSocketEnd.bind(this));
    this.socket.on('close', this.handleSocketClose.bind(this));
    this.socket.on('drain', this.handleSocketDrain.bind(this));
    
    // Disable nagle algorithm?
    this.socket.setNoDelay(this.config.disableNagleAlgorithm);
    
    // Make sure there is no socket inactivity timeout
    this.socket.setTimeout(0);
    
    this.outgoingFrameQueue = [];
    this.outputPaused = false;
    this.outgoingFrameQueueHandler = this.processOutgoingFrameQueue.bind(this);
    this.bytesWaitingToFlush = 0;
    
    this._closeTimerHandler = this.handleCloseTimer.bind(this);
    
    if (this.config.keepalive && !this.config.useNativeKeepalive) {
        if (typeof(this.config.keepaliveInterval) !== 'number') {
            throw new Error("keepaliveInterval must be specified and numeric " +
                            "if keepalive is true.");
        }
        this._keepaliveTimerHandler = this.handleKeepaliveTimer.bind(this);
        this.setKeepaliveTimer();
        
        if (this.config.dropConnectionOnKeepaliveTimeout) {
            if (typeof(this.config.keepaliveGracePeriod) !== 'number') {
                throw new Error("keepaliveGracePeriod  must be specified and " +
                                "numeric if dropConnectionOnKeepaliveTimeout " +
                                "is true.")
            }
            this._gracePeriodTimerHandler = this.handleGracePeriodTimer.bind(this);
        }
    }
    else if (this.config.keepalive && this.config.useNativeKeepalive) {
        if (!('setKeepAlive' in this.socket)) {
            throw new Error("Unable to use native keepalive: unsupported by " +
                            "this version of Node.");
        }
        this.socket.setKeepAlive(true, this.config.keepaliveInterval);
    }
}

WebSocketConnection.CLOSE_REASON_NORMAL = 1000;
WebSocketConnection.CLOSE_REASON_GOING_AWAY = 1001;
WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR = 1002;
WebSocketConnection.CLOSE_REASON_UNPROCESSABLE_INPUT = 1003;
WebSocketConnection.CLOSE_REASON_RESERVED = 1004; // Reserved value.  Undefined meaning.
WebSocketConnection.CLOSE_REASON_NOT_PROVIDED = 1005; // Not to be used on the wire
WebSocketConnection.CLOSE_REASON_ABNORMAL = 1006; // Not to be used on the wire
WebSocketConnection.CLOSE_REASON_INVALID_DATA = 1007;
WebSocketConnection.CLOSE_REASON_POLICY_VIOLATION = 1008;
WebSocketConnection.CLOSE_REASON_MESSAGE_TOO_BIG = 1009;
WebSocketConnection.CLOSE_REASON_EXTENSION_REQUIRED = 1010;
WebSocketConnection.CLOSE_REASON_INTERNAL_SERVER_ERROR = 1011;
WebSocketConnection.CLOSE_REASON_TLS_HANDSHAKE_FAILED = 1015; // Not to be used on the wire

WebSocketConnection.CLOSE_DESCRIPTIONS = {
    1000: "Normal connection closure",
    1001: "Remote peer is going away",
    1002: "Protocol error",
    1003: "Unprocessable input",
    1004: "Reserved",
    1005: "Reason not provided",
    1006: "Abnormal closure, no further detail available",
    1007: "Invalid data received",
    1008: "Policy violation",
    1009: "Message too big",
    1010: "Extension requested by client is required",
    1011: "Internal Server Error",
    1015: "TLS Handshake Failed"
};

function validateReceivedCloseReason(code) {
    if (code < 1000) {
        // Status codes in the range 0-999 are not used
        return false;
    }
    if (code >= 1000 && code <= 2999) {
        // Codes from 1000 - 2999 are reserved for use by the protocol.  Only
        // a few codes are defined, all others are currently illegal.
        return [1000, 1001, 1002, 1003, 1007, 1008, 1009, 1010, 1011].indexOf(code) !== -1
    }
    if (code >= 3000 && code <= 3999) {
        // Reserved for use by libraries, frameworks, and applications.
        // Should be registered with IANA.  Interpretation of these codes is
        // undefined by the WebSocket protocol.
        return true;
    }
    if (code >= 4000 && code <= 4999) {
        // Reserved for private use.  Interpretation of these codes is
        // undefined by the WebSocket protocol.
        return true;
    }
    if (code >= 5000) {
        return false;
    }
}

util.inherits(WebSocketConnection, EventEmitter);

// set or reset the keepalive timer when data is received.
WebSocketConnection.prototype.setKeepaliveTimer = function() {
    if (!this.config.keepalive) { return; }
    if (this._keepaliveTimeoutID) {
        clearTimeout(this._keepaliveTimeoutID);
    }
    if (this._gracePeriodTimeoutID) {
        clearTimeout(this._gracePeriodTimeoutID);
    }
    this._keepaliveTimeoutID = setTimeout(this._keepaliveTimerHandler, this.config.keepaliveInterval);
};

// No data has been received within config.keepaliveTimeout ms.
WebSocketConnection.prototype.handleKeepaliveTimer = function() {
    this._keepaliveTimeoutID = null;
    this.ping();
    
    // If we are configured to drop connections if the client doesn't respond
    // then set the grace period timer.
    if (this.config.dropConnectionOnKeepaliveTimeout) {
        this.setGracePeriodTimer();
    }
    else {
        // Otherwise reset the keepalive timer to send the next ping.
        this.setKeepaliveTimer();
    }
};

WebSocketConnection.prototype.setGracePeriodTimer = function() {
    if (this._gracePeriodTimeoutID) {
        clearTimeout(this._gracePeriodTimeoutID);
    }
    this._gracePeriodTimeoutID = setTimeout(this._gracePeriodTimerHandler, this.config.keepaliveGracePeriod);
};

WebSocketConnection.prototype.handleGracePeriodTimer = function() {
    // If this is called, the client has not responded and is assumed dead.
    this._gracePeriodTimeoutID = null;
    this.drop(WebSocketConnection.CLOSE_REASON_ABNORMAL, "Peer not responding.", true);
};

WebSocketConnection.prototype.handleSocketData = function(data) {
    // Reset the keepalive timer when receiving data of any kind.
    this.setKeepaliveTimer();
    
    // Add received data to our bufferList, which efficiently holds received
    // data chunks in a linked list of Buffer objects.
    this.bufferList.write(data);
    
    // currentFrame.addData returns true if all data necessary to parse
    // the frame was available.  It returns false if we are waiting for
    // more data to come in on the wire.
    while (this.connected && this.currentFrame.addData(this.bufferList)) {
        
        // Handle possible parsing errors
        if (this.currentFrame.protocolError) {
            // Something bad happened.. get rid of this client.
            this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR, this.currentFrame.dropReason);
            return;
        }
        else if (this.currentFrame.frameTooLarge) {
            this.drop(WebSocketConnection.CLOSE_REASON_MESSAGE_TOO_BIG, this.currentFrame.dropReason);
            return;
        }
        
        // For now since we don't support extensions, all RSV bits are illegal
        if (this.currentFrame.rsv1 || this.currentFrame.rsv2 || this.currentFrame.rsv3) {
            this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
                      "Unsupported usage of rsv bits without negotiated extension.");
        }
        
        if (!this.assembleFragments) {
            this.emit('frame', this.currentFrame);
        }
        this.processFrame(this.currentFrame);
        this.currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    }
};

WebSocketConnection.prototype.handleSocketError = function(error) {
    // console.log((new Date()) + " - Socket Error - Closing Connection: " + error);
    if (this.listeners('error').length > 0) {
        this.emit('error', error);
    }
    this.socket.end();
};

WebSocketConnection.prototype.handleSocketEnd = function() {
    // console.log((new Date()) + " - Socket End");
    this.socket.end();
    this.frameQueue = null;
    this.outgoingFrameQueue = [];
    this.fragmentationSize = 0;
    this.bufferList = null;
};

WebSocketConnection.prototype.handleSocketClose = function(hadError) {
    // console.log((new Date()) + " - Socket Close");
    this.socketHadError = hadError;
    this.connected = false;
    this.state = STATE_CLOSED;
    // If closeReasonCode is still set to -1 at this point then we must
    // not have received a close frame!!
    if (this.closeReasonCode === -1) {
        this.closeReasonCode = WebSocketConnection.CLOSE_REASON_ABNORMAL;
        this.closeDescription = "Connection dropped by remote peer.";
    }
    if (!this.closeEventEmitted) {
        this.closeEventEmitted = true;
        // console.log((new Date()) + " - Emitting WebSocketConnection close event");
        this.emit('close', this.closeReasonCode, this.closeDescription);
    }
    this.clearCloseTimer();
    if (this._keepaliveTimeoutID) {
        clearTimeout(this._keepaliveTimeoutID);
    }
};

WebSocketConnection.prototype.handleSocketDrain = function() {
    this.outputPaused = false;
    this.processOutgoingFrameQueue();
};

WebSocketConnection.prototype.close = function() {
    // console.log((new Date()) + " - Initating clean WebSocket close sequence.");
    if (this.connected) {
        this.closeReasonCode = WebSocketConnection.CLOSE_REASON_NORMAL;
        this.closeDescription = WebSocketConnection.CLOSE_DESCRIPTIONS[this.closeReasonCode];
        this.setCloseTimer();
        this.sendCloseFrame();
        this.state = STATE_CLOSING;
        this.connected = false;
    }
};

WebSocketConnection.prototype.drop = function(reasonCode, description, skipCloseFrame) {
    if (typeof(reasonCode) !== 'number') {
        reasonCode = WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR;
    }
    var logText = "WebSocket: Dropping Connection. Code: " + reasonCode.toString(10);
    
    if (typeof(description) !== 'string') {
        // If no description is provided, try to look one up based on the
        // specified reasonCode.
        description = WebSocketConnection.CLOSE_DESCRIPTIONS[reasonCode];
    }
    if (description) {
        logText += (" - " + description);
    }
    // console.error((new Date()) + " " + logText);
    
    this.closeReasonCode = reasonCode;
    this.closeDescription = description;
    this.outgoingFrameQueue = [];
    this.frameQueue = [];
    this.fragmentationSize = 0;
    if (!skipCloseFrame) {
        this.sendCloseFrame(reasonCode, description, true);
    }
    this.connected = false;
    this.state = STATE_CLOSED;
    this.closeEventEmitted = true;
    this.emit('close', reasonCode, description);
    this.socket.destroy();
};

WebSocketConnection.prototype.setCloseTimer = function() {
    this.clearCloseTimer();
    // console.log((new Date()) + " - Setting close timer");
    this.waitingForCloseResponse = true;
    this.closeTimer = setTimeout(this._closeTimerHandler, this.closeTimeout);
};

WebSocketConnection.prototype.clearCloseTimer = function() {
    if (this.closeTimer) {
        // console.log((new Date()) + " - Clearing close timer");
        clearTimeout(this.closeTimer);
        this.waitingForCloseResponse = false;
        this.closeTimer = null;
    }
};

WebSocketConnection.prototype.handleCloseTimer = function() {
    this.closeTimer = null;
    if (this.waitingForCloseResponse) {
        // console.log((new Date()) + " - Close response not received from client.  Forcing socket end.");
        this.waitingForCloseResponse = false;
        this.socket.end();
    }
};

WebSocketConnection.prototype.processFrame = function(frame) {
    var i;
    var message;
    
    // Any non-control opcode besides 0x00 (continuation) received in the
    // middle of a fragmented message is illegal.
    if (this.frameQueue.length !== 0 && (frame.opcode > 0x00 && frame.opcode < 0x08)) {
        this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
                  "Illegal frame opcode 0x" + frame.opcode.toString(16) + " " +
                  "received in middle of fragmented message.");
        return;
    }
    
    switch(frame.opcode) {
        case 0x02: // WebSocketFrame.BINARY_FRAME
            if (this.assembleFragments) {
                if (frame.fin) {
                    // Complete single-frame message received
                    this.emit('message', {
                        type: 'binary',
                        binaryData: frame.binaryPayload
                    });
                }
                else {
                    // beginning of a fragmented message
                    this.frameQueue.push(frame);
                    this.fragmentationSize = frame.length;
                }
            }
            break;
        case 0x01: // WebSocketFrame.TEXT_FRAME
            if (this.assembleFragments) {
                if (frame.fin) {
                    if (!Validation.isValidUTF8(frame.binaryPayload)) {
                        this.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,
                                  "Invalid UTF-8 Data Received");
                        return;
                    }
                    // Complete single-frame message received
                    this.emit('message', {
                        type: 'utf8',
                        utf8Data: frame.binaryPayload.toString('utf8')
                    });
                }
                else {
                    // beginning of a fragmented message
                    this.frameQueue.push(frame);
                    this.fragmentationSize = frame.length;
                }
            }
            break;
        case 0x00: // WebSocketFrame.CONTINUATION
            if (this.assembleFragments) {
                if (this.frameQueue.length === 0) {
                    this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
                              "Unexpected Continuation Frame");
                    return;
                }

                this.fragmentationSize += frame.length;

                if (this.fragmentationSize > this.maxReceivedMessageSize) {
                    this.drop(WebSocketConnection.CLOSE_REASON_MESSAGE_TOO_BIG,
                              "Maximum message size exceeded.");
                    return;
                }

                this.frameQueue.push(frame);
            
                if (frame.fin) {
                    // end of fragmented message, so we process the whole
                    // message now.  We also have to decode the utf-8 data
                    // for text frames after combining all the fragments.
                    var bytesCopied = 0;
                    var binaryPayload = new Buffer(this.fragmentationSize);
                    this.frameQueue.forEach(function (currentFrame) {
                        currentFrame.binaryPayload.copy(binaryPayload, bytesCopied);
                        bytesCopied += currentFrame.binaryPayload.length;
                    });
                
                    switch (this.frameQueue[0].opcode) {
                        case 0x02: // WebSocketOpcode.BINARY_FRAME
                            this.emit('message', {
                                type: 'binary',
                                binaryData: binaryPayload
                            });
                            break;
                        case 0x01: // WebSocketOpcode.TEXT_FRAME
                            if (!Validation.isValidUTF8(binaryPayload)) {
                                this.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,
                                          "Invalid UTF-8 Data Received");
                                return;
                            }
                            this.emit('message', {
                                type: 'utf8',
                                utf8Data: binaryPayload.toString('utf8')
                            });
                            break;
                        default:
                            this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
                                      "Unexpected first opcode in fragmentation sequence: 0x" + this.frameQueue[0].opcode.toString(16));
                            return;
                    }
                
                    this.frameQueue = [];
                    this.fragmentationSize = 0;
                }
            }
            break;
        case 0x09: // WebSocketFrame.PING
            this.pong(frame.binaryPayload);
            break;
        case 0x0A: // WebSocketFrame.PONG
            break;
        case 0x08: // WebSocketFrame.CONNECTION_CLOSE
            // console.log((new Date()) + " - Received close frame");
            if (this.waitingForCloseResponse) {
                // Got response to our request to close the connection.
                // Close is complete, so we just hang up.
                // console.log((new Date()) + " - Got close response from peer.");
                this.clearCloseTimer();
                this.waitingForCloseResponse = false;
                this.state = STATE_CLOSED;
                this.socket.end();
            }
            else {
                // Got request from other party to close connection.
                // Send back acknowledgement and then hang up.
                this.state = STATE_CLOSING;
                var respondCloseReasonCode;

                // Make sure the close reason provided is legal according to
                // the protocol spec.  Providing no close status is legal.
                // WebSocketFrame sets closeStatus to -1 by default, so if it
                // is still -1, then no status was provided.
                if (frame.invalidCloseFrameLength) {
                    this.closeReasonCode = 1005; // 1005 = No reason provided.
                    respondCloseReasonCode = WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR;
                }
                else if (frame.closeStatus === -1 || validateReceivedCloseReason(frame.closeStatus)) {
                    this.closeReasonCode = frame.closeStatus;
                    respondCloseReasonCode = WebSocketConnection.CLOSE_REASON_NORMAL;
                }
                else {
                    this.closeReasonCode = frame.closeStatus;
                    respondCloseReasonCode = WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR;
                }
                
                // If there is a textual description in the close frame, extract it.
                if (frame.binaryPayload.length > 1) {
                    if (!Validation.isValidUTF8(frame.binaryPayload)) {
                        this.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,
                                  "Invalid UTF-8 Data Received");
                        return;
                    }
                    this.closeDescription = frame.binaryPayload.toString('utf8');
                }
                else {
                    this.closeDescription = WebSocketConnection.CLOSE_DESCRIPTIONS[this.closeReasonCode];
                }
                // console.log((new Date()) + " Remote peer " + this.remoteAddress +
                // " requested disconnect, code: " + this.closeReasonCode + " - " + this.closeDescription +
                // " - close frame payload length: " + frame.length);
                this.sendCloseFrame(respondCloseReasonCode);
                this.socket.end();
                this.connected = false;
            }
            break;
        default:
            this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
                      "Unrecognized Opcode: 0x" + frame.opcode.toString(16));
            break;
    }
};

WebSocketConnection.prototype.send = function(data, cb) {
    if (Buffer.isBuffer(data)) {
        this.sendBytes(data, cb);
    }
    else if (typeof(data['toString']) === 'function') {
        this.sendUTF(data, cb);
    }
    else {
        throw new Error("Data provided must either be a Node Buffer or implement toString()")
    }
};

WebSocketConnection.prototype.sendUTF = function(data, cb) {
    var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    frame.opcode = 0x01; // WebSocketOpcode.TEXT_FRAME
    frame.binaryPayload = new Buffer(data.toString(), 'utf8');
    this.fragmentAndSend(frame, cb);
};
    
WebSocketConnection.prototype.sendBytes = function(data, cb) {
    if (!Buffer.isBuffer(data)) {
        throw new Error("You must pass a Node Buffer object to WebSocketConnection.prototype.sendBytes()");
    }
    var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    frame.opcode = 0x02; // WebSocketOpcode.BINARY_FRAME
    frame.binaryPayload = data;
    this.fragmentAndSend(frame, cb);
};

WebSocketConnection.prototype.ping = function(data) {
    var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    frame.opcode = 0x09; // WebSocketOpcode.PING
    frame.fin = true;
    if (data) {
        if (!Buffer.isBuffer(data)) {
            data = new Buffer(data.toString(), 'utf8')
        }
        if (data.length > 125) {
            // console.warn("WebSocket: Data for ping is longer than 125 bytes.  Truncating.");
            data = data.slice(0,124);
        }
        frame.binaryPayload = data;
    }
    this.sendFrame(frame);
};

// Pong frames have to echo back the contents of the data portion of the
// ping frame exactly, byte for byte.
WebSocketConnection.prototype.pong = function(binaryPayload) {
    var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    frame.opcode = 0x0A; // WebSocketOpcode.PONG
    if (Buffer.isBuffer(binaryPayload) && binaryPayload.length > 125) {
        // console.warn("WebSocket: Data for pong is longer than 125 bytes.  Truncating.");
        binaryPayload = binaryPayload.slice(0,124);
    }
    frame.binaryPayload = binaryPayload;
    frame.fin = true;
    this.sendFrame(frame);
};

WebSocketConnection.prototype.fragmentAndSend = function(frame, cb) {
    if (frame.opcode > 0x07) {
        throw new Error("You cannot fragment control frames.");
    }
    
    var threshold = this.config.fragmentationThreshold;
    var length = frame.binaryPayload.length;
    
    if (this.config.fragmentOutgoingMessages && frame.binaryPayload && length > threshold) {
        var numFragments = Math.ceil(length / threshold);
        var sentFragments = 0;
        var sentCallback = function (err) {
            if (err) {
                if (typeof cb === 'function') {
                    // pass only the first error
                    cb(err);
                    cb = null;
                }
                return;
            }
            ++sentFragments;
            if ((typeof cb === 'function') && (sentFragments === numFragments)) {
                cb();
            }
        }
        for (var i=1; i <= numFragments; i++) {
            var currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
            
            // continuation opcode except for first frame.
            currentFrame.opcode = (i === 1) ? frame.opcode : 0x00;
            
            // fin set on last frame only
            currentFrame.fin = (i === numFragments);
            
            // length is likely to be shorter on the last fragment
            var currentLength = (i === numFragments) ? length - (threshold * (i-1)) : threshold;
            var sliceStart = threshold * (i-1);
            
            // Slice the right portion of the original payload
            currentFrame.binaryPayload = frame.binaryPayload.slice(sliceStart, sliceStart + currentLength);
            
            this.sendFrame(currentFrame, sentCallback);
        }
    }
    else {
        frame.fin = true;
        this.sendFrame(frame, cb);
    }
};

WebSocketConnection.prototype.sendCloseFrame = function(reasonCode, reasonText, force) {
    if (typeof(reasonCode) !== 'number') {
        reasonCode = WebSocketConnection.CLOSE_REASON_NORMAL;
    }
    var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    frame.fin = true;
    frame.opcode = 0x08; // WebSocketOpcode.CONNECTION_CLOSE
    frame.closeStatus = reasonCode;
    if (typeof(reasonText) === 'string') {
        frame.binaryPayload = new Buffer(reasonText, 'utf8');
    }
    
    this.sendFrame(frame, force);
};

WebSocketConnection.prototype.sendFrame = function(frame, force, cb) {
    if (typeof force === 'function') {
        cb = force;
        force = false;
    }
    frame.mask = this.maskOutgoingPackets;
    var buffer = frame.toBuffer();
    this.outgoingFrameQueue.unshift([buffer, cb]);
    this.bytesWaitingToFlush += buffer.length;
    if (!this.outputPaused || force) {
        this.processOutgoingFrameQueue();
    }
};

WebSocketConnection.prototype.processOutgoingFrameQueue = function() {
    if (this.outputPaused) { return; }
    if (this.outgoingFrameQueue.length > 0) {
        var current = this.outgoingFrameQueue.pop();
        var buffer = current[0];
        var cb = current[1];
        // there is no need to accumulate messages in the queue if connection closed
        // connection will not be restored and messages will never be sent
        // therefore, notify callbacks about it
        if (!this.connected && (typeof cb === 'function')) {
            cb("Connection closed");
            return;
        }
        try {
            var flushed = this.socket.write(buffer, cb);
        }
        catch(e) {
            if (typeof cb === 'function') {
                cb(e.toString());
            }
            if (this.listeners('error').length > 0) {
                this.emit("error", "Error while writing to socket: " + e.toString());
            }
            else {
                if (Constants.DEBUG) {
                    console.warn("Error while writing to socket: " + e.toString());
                }
            }
            return;
        }
        this.bytesWaitingToFlush -= buffer.length;
        if (!flushed) {
            this.outputPaused = true;
            return;
        }
        process.nextTick(this.outgoingFrameQueueHandler);
    }
};

module.exports = WebSocketConnection;