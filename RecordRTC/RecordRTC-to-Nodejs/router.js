// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Source Code   - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-Nodejs

function respondWithHTTPCode(response, code) {
    response.writeHead(code, { 'Content-Type': 'text/plain' });
    response.end();
}

function route(handle, pathname, response, postData) {

    var extension = pathname.split('.').pop();

    var staticFiles = {
        js: 'js',
        gif: 'gif',
        css: 'css',
        webm: 'webm',
        mp4: 'mp4',
        wav: 'wav',
        ogg: 'ogg'
    };

    if ('function' === typeof handle[pathname]) {
        handle[pathname](response, postData);
    } else if (staticFiles[extension]) {
        handle._static(response, pathname, postData);
    } else {
        respondWithHTTPCode(response, 404);
    }
}

exports.route = route;
