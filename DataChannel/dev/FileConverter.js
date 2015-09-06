var FileConverter = {
    DataURLToBlob: function(dataURL, fileType, callback) {

        function processInWebWorker() {
            var blob = URL.createObjectURL(new Blob(['function getBlob(_dataURL, _fileType) {var binary = atob(_dataURL.substr(_dataURL.indexOf(",") + 1)),i = binary.length,view = new Uint8Array(i);while (i--) {view[i] = binary.charCodeAt(i);};postMessage(new Blob([view], {type: _fileType}));};this.onmessage =  function (e) {var data = JSON.parse(e.data); getBlob(data.dataURL, data.fileType);}'], {
                type: 'application/javascript'
            }));

            var worker = new Worker(blob);
            URL.revokeObjectURL(blob);
            return worker;
        }

        if (!!window.Worker && !isMobileDevice) {
            var webWorker = processInWebWorker();

            webWorker.onmessage = function(event) {
                callback(event.data);
            };

            webWorker.postMessage(JSON.stringify({
                dataURL: dataURL,
                fileType: fileType
            }));
        } else {
            var binary = atob(dataURL.substr(dataURL.indexOf(',') + 1)),
                i = binary.length,
                view = new Uint8Array(i);

            while (i--) {
                view[i] = binary.charCodeAt(i);
            }

            callback(new Blob([view]));
        }
    }
};
