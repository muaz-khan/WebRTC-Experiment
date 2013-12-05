// 2013, Muaz Khan - www.MuazKhan.com
// MIT License     - www.WebRTC-Experiment.com/licence
// Experiments     - github.com/muaz-khan/WebRTC-Experiment

var server = require('./server'),
    handlers = require('./handlers'),
    router = require('./router'),
    handle = { };

handle["/"] = handlers.home;
handle["/home"] = handlers.home;
handle["/upload"] = handlers.upload;
handle._static = handlers.serveStatic;

server.start(router.route, handle);
