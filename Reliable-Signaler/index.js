// Note: Code in this file is taken from socket.io github repository
// It is added merely to provide direct access of this script:

// <script src="/reliable-signaler/signaler.js"></script>

// Remember, there is a separate file named as "reliable-signaler.js"
// which handles socket.io signaling part.

var http = require('http');
var read = require('fs').readFileSync;
var parse = require('url').parse;
var url = require('url');

module.exports = Server;

function Server(srv, opts) {
    if (!(this instanceof Server)) return new Server(srv, opts);
    if ('object' == typeof srv && !srv.listen) {
        opts = srv;
        srv = null;
    }
    //console.log(opts);
    opts = opts || {};
    this.nsps = {};
    this.path(opts.path || '/reliable-signaler/signaler.js');
    this.serveClient(false !== opts.serveClient);
    this.origins(opts.origins || '*:*');
    if (srv) this.attach(srv, opts);
}

Server.prototype.path = function(v) {
    if (!arguments.length) return this._path;
    this._path = v.replace(/\/$/, '');
    return this;
};

Server.prototype.checkRequest = function(req, fn) {
    var origin = req.headers.origin || req.headers.referer;

    // file:// URLs produce a null Origin which can't be authorized via echo-back
    if ('null' == origin) origin = '*';

    if (!!origin && typeof(this._origins) == 'function') return this._origins(origin, fn);
    if (this._origins.indexOf('*:*') !== -1) return fn(null, true);
    if (origin) {
        try {
            var parts = url.parse(origin);
            parts.port = parts.port || 80;
            var ok = ~this._origins.indexOf(parts.hostname + ':' + parts.port) ||
                ~this._origins.indexOf(parts.hostname + ':*') ||
                ~this._origins.indexOf('*:' + parts.port);
            return fn(null, !!ok);
        } catch (ex) {}
    }
    fn(null, false);
};

Server.prototype.serveClient = function(v) {
    if (!arguments.length) return this._serveClient;
    this._serveClient = v;
    return this;
};

var oldSettings = {
    "transports": "transports",
    "heartbeat timeout": "pingTimeout",
    "heartbeat interval": "pingInterval",
    "destroy buffer size": "maxHttpBufferSize"
};

Server.prototype.set = function(key, val) {
    if ('authorization' == key && val) {
        this.use(function(socket, next) {
            val(socket.request, function(err, authorized) {
                if (err) return next(new Error(err));
                if (!authorized) return next(new Error('Not authorized'));
                next();
            });
        });
    } else if ('origins' == key && val) {
        this.origins(val);
    } else if ('resource' == key) {
        this.path(val);
    } else if (oldSettings[key] && this.eio[oldSettings[key]]) {
        this.eio[oldSettings[key]] = val;
    } else {
        console.error('Option %s is not valid. Please refer to the README.', key);
    }

    return this;
};

Server.prototype.origins = function(v) {
    if (!arguments.length) return this._origins;

    this._origins = v;
    return this;
};

Server.prototype.listen =
    Server.prototype.attach = function(srv, opts) {
        if ('function' == typeof srv) {
            var msg = 'You are trying to attach reliable-signaler to an express' +
                'request handler function. Please pass a http.Server instance.';
            throw new Error(msg);
        }

        // handle a port as a string
        if (Number(srv) == srv) {
            srv = Number(srv);
        }

        if ('number' == typeof srv) {
            var port = srv;
            srv = http.Server(function(req, res) {
                res.writeHead(404);
                res.end();
            });
            srv.listen(port);
        }

        // set engine.io path to `/reliable-signaler`
        opts = opts || {};
        opts.path = opts.path || this.path();
        // set origins verification
        opts.allowRequest = this.checkRequest.bind(this);

        // attach static file serving
        if (this._serveClient) this.attachServe(srv);

        // Export http server
        this.httpServer = srv;
        
        require('./reliable-signaler.js').ReliableSignaler(srv, opts.socketCallback || function() {});

        return this;
    };

Server.prototype.attachServe = function(srv) {
    var url = this._path;
    var evs = srv.listeners('request').slice(0);
    var self = this;
    srv.removeAllListeners('request');
    srv.on('request', function(req, res) {
        if (0 == req.url.indexOf(url)) {
            self.serve(req, res);
        } else {
            for (var i = 0; i < evs.length; i++) {
                evs[i].call(srv, req, res);
            }
        }
    });
};

Server.prototype.serve = function(req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.writeHead(200);
    res.end(read('node_modules' + this._path, 'utf-8'));
};

Server.listen = Server;
