var CanvasDesigner = (function() {
    var iframe;
    var tools = {
        line: true,
        pencil: true,
        dragSingle: true,
        dragMultiple: true,
        eraser: true,
        rectangle: true,
        arc: true,
        bezier: true,
        quadratic: true,
        text: true,
        image: true
    };
    var selectedIcon = 'pencil';

    function syncData(data) {
        if (!iframe) return;

        iframe.contentWindow.postMessage({
            canvasDesignerSyncData: data
        }, '*');
    }

    var syncDataListener = function(data) {};
    var dataURLListener = function(dataURL) {};
    
    function onMessage(event) {
        if(!event.data) return;

        if (!!event.data.canvasDesignerSyncData) {
            CanvasDesigner.pointsLength = event.data.canvasDesignerSyncData.length;
            syncDataListener(event.data.canvasDesignerSyncData);
        }

        if (!!event.data.dataURL) {
            dataURLListener(event.data.dataURL);
        }
    }

    return {
        appendTo: function(parentNode) {
            iframe = document.createElement('iframe');
            iframe.src = this.widgetHtmlURL +  '?widgetJsURL=' + this.widgetJsURL + '&tools=' + JSON.stringify(tools) + '&selectedIcon=' + selectedIcon;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 0;
            parentNode.appendChild(iframe);

            window.removeEventListener('message', onMessage);
            window.addEventListener('message', onMessage, false);
        },
        destroy: function() {
            if(iframe) {
                iframe.parentNode.removeChild(iframe);
            }
            window.removeEventListener('message', onMessage);
        },
        addSyncListener: function(callback) {
            syncDataListener = callback;
        },
        syncData: syncData,
        setTools: function(_tools) {
            tools = _tools;
        },
        setSelected: function(icon) {
            if (typeof tools[icon] !== 'undefined') {
                selectedIcon = icon;
            }
        },
        toDataURL: function(format, callback) {
            dataURLListener = callback;
            if (!iframe) return;
            iframe.contentWindow.postMessage({
                genDataURL: true,
                format: format
            }, '*');
        },
        sync: function() {
            if (!iframe) return;
            iframe.contentWindow.postMessage({
                syncPoints: true
            }, '*');
        },
        pointsLength: 0,
        undo: function(index) {
            if (!iframe) return;
            iframe.contentWindow.postMessage({
                undo: true,
                index: index || this.pointsLength - 1 || -1
            }, '*');
        },
        widgetHtmlURL: 'widget.html',
        widgetJsURL: 'widget.min.js'
    };
})();
