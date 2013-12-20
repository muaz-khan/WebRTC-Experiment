module.exports = {
    "server"     : require('./WebSocketServer'),
    "client"     : require('./WebSocketClient'),
    "router"     : require('./WebSocketRouter'),
    "frame"      : require('./WebSocketFrame'),
    "request"    : require('./WebSocketRequest'),
    "connection" : require('./WebSocketConnection'),
    "constants"  : require('./Constants'),
    "deprecation": require('./Deprecation'),
    "version"    : "1.0.8"
};