var canvas = tempContext.canvas,
    isTouch = 'createTouch' in document;

addEvent(canvas, isTouch ? 'touchstart mousedown' : 'mousedown', function(e) {
    if (isTouch) e = e.pageX ? e : e.touches.length ? e.touches[0] : {
        pageX: 0,
        pageY: 0
    };

    var cache = is;

    if (cache.isLine) lineHandler.mousedown(e);
    else if (cache.isArc) arcHandler.mousedown(e);
    else if (cache.isRectangle) rectHandler.mousedown(e);
    else if (cache.isQuadraticCurve) quadraticHandler.mousedown(e);
    else if (cache.isBezierCurve) bezierHandler.mousedown(e);
    else if (cache.isDragLastPath || cache.isDragAllPaths) dragHelper.mousedown(e);
    else if (cache.isPencil) pencilHandler.mousedown(e);
    else if (cache.isEraser) eraserHandler.mousedown(e);
    else if (cache.isText) textHandler.mousedown(e);
    else if (cache.isImage) imageHandler.mousedown(e);
    else if (cache.isArrow) arrowHandler.mousedown(e);
    else if (cache.isMarker) markerHandler.mousedown(e);

    drawHelper.redraw();

    preventStopEvent(e);
});

function preventStopEvent(e) {
    if (!e) {
        return;
    }

    if (typeof e.preventDefault === 'function') {
        e.preventDefault();
    }

    if (typeof e.stopPropagation === 'function') {
        e.stopPropagation();
    }
}

addEvent(canvas, isTouch ? 'touchend touchcancel mouseup' : 'mouseup', function(e) {
    if (isTouch && (!e || !('pageX' in e))) {
        if (e && e.touches && e.touches.length) {
            e = e.touches[0];
        } else if (e && e.changedTouches && e.changedTouches.length) {
            e = e.changedTouches[0];
        } else {
            e = {
                pageX: 0,
                pageY: 0
            }
        }
    }

    var cache = is;

    if (cache.isLine) lineHandler.mouseup(e);
    else if (cache.isArc) arcHandler.mouseup(e);
    else if (cache.isRectangle) rectHandler.mouseup(e);
    else if (cache.isQuadraticCurve) quadraticHandler.mouseup(e);
    else if (cache.isBezierCurve) bezierHandler.mouseup(e);
    else if (cache.isDragLastPath || cache.isDragAllPaths) dragHelper.mouseup(e);
    else if (cache.isPencil) pencilHandler.mouseup(e);
    else if (cache.isEraser) eraserHandler.mouseup(e);
    else if (cache.isText) textHandler.mouseup(e);
    else if (cache.isImage) imageHandler.mouseup(e);
    else if (cache.isArrow) arrowHandler.mouseup(e);
    else if (cache.isMarker) markerHandler.mouseup(e);

    drawHelper.redraw();

    syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);

    preventStopEvent(e);
});

addEvent(canvas, isTouch ? 'touchmove mousemove' : 'mousemove', function(e) {
    if (isTouch) e = e.pageX ? e : e.touches.length ? e.touches[0] : {
        pageX: 0,
        pageY: 0
    };

    var cache = is;

    if (cache.isLine) lineHandler.mousemove(e);
    else if (cache.isArc) arcHandler.mousemove(e);
    else if (cache.isRectangle) rectHandler.mousemove(e);
    else if (cache.isQuadraticCurve) quadraticHandler.mousemove(e);
    else if (cache.isBezierCurve) bezierHandler.mousemove(e);
    else if (cache.isDragLastPath || cache.isDragAllPaths) dragHelper.mousemove(e);
    else if (cache.isPencil) pencilHandler.mousemove(e);
    else if (cache.isEraser) eraserHandler.mousemove(e);
    else if (cache.isText) textHandler.mousemove(e);
    else if (cache.isImage) imageHandler.mousemove(e);
    else if (cache.isArrow) arrowHandler.mousemove(e);
    else if (cache.isMarker) markerHandler.mousemove(e);

    preventStopEvent(e);
});

var keyCode;

function onkeydown(e) {
    keyCode = e.which || e.keyCode || 0;

    if (keyCode == 8 || keyCode == 46) {
        if (isBackKey(e, keyCode)) {
            // back key pressed
        }
        return;
    }

    if (e.metaKey) {
        isControlKeyPressed = true;
        keyCode = 17;
    }

    if (!isControlKeyPressed && keyCode === 17) {
        isControlKeyPressed = true;
    }
}

function isBackKey(e, keyCode) {
    var doPrevent = false;
    var d = e.srcElement || e.target;
    if ((d.tagName.toUpperCase() === 'INPUT' &&
            (
                d.type.toUpperCase() === 'TEXT' ||
                d.type.toUpperCase() === 'PASSWORD' ||
                d.type.toUpperCase() === 'FILE' ||
                d.type.toUpperCase() === 'SEARCH' ||
                d.type.toUpperCase() === 'EMAIL' ||
                d.type.toUpperCase() === 'NUMBER' ||
                d.type.toUpperCase() === 'DATE')
        ) ||
        d.tagName.toUpperCase() === 'TEXTAREA') {
        doPrevent = d.readOnly || d.disabled;
    } else {
        doPrevent = true;
    }

    if (doPrevent) {
        e.preventDefault();
    }
    return doPrevent;
}

addEvent(document, 'keydown', onkeydown);

function onkeyup(e) {
    if (e.which == null && (e.charCode != null || e.keyCode != null)) {
        e.which = e.charCode != null ? e.charCode : e.keyCode;
    }

    keyCode = e.which || e.keyCode || 0;

    if (keyCode === 13 && is.isText) {
        textHandler.onReturnKeyPressed();
        return;
    }

    if (keyCode == 8 || keyCode == 46) {
        if (isBackKey(e, keyCode)) {
            textHandler.writeText(textHandler.lastKeyPress, true);
        }
        return;
    }

    // Ctrl + t
    if (isControlKeyPressed && keyCode === 84 && is.isText) {
        textHandler.showTextTools();
        return;
    }

    // Ctrl + z
    if (isControlKeyPressed && keyCode === 90) {
        if (points.length) {
            points.length = points.length - 1;
            drawHelper.redraw();

            syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);
        }
    }

    // Ctrl + a
    if (isControlKeyPressed && keyCode === 65) {
        dragHelper.global.startingIndex = 0;

        endLastPath();

        setSelection(find('drag-all-paths'), 'DragAllPaths');
    }

    // Ctrl + c
    if (isControlKeyPressed && keyCode === 67 && points.length) {
        copy();
    }

    // Ctrl + v
    if (isControlKeyPressed && keyCode === 86 && copiedStuff.length) {
        paste();

        syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);
    }

    // Ending the Control Key
    if (typeof e.metaKey !== 'undefined' && e.metaKey === false) {
        isControlKeyPressed = false;
        keyCode = 17;
    }

    if (keyCode === 17) {
        isControlKeyPressed = false;
    }
}

addEvent(document, 'keyup', onkeyup);

function onkeypress(e) {
    if (e.which == null && (e.charCode != null || e.keyCode != null)) {
        e.which = e.charCode != null ? e.charCode : e.keyCode;
    }

    keyCode = e.which || e.keyCode || 0;

    var inp = String.fromCharCode(keyCode);
    if (/[a-zA-Z0-9-_ !?|\/'",.=:;(){}\[\]`~@#$%^&*+-]/.test(inp)) {
        textHandler.writeText(String.fromCharCode(keyCode));
    }
}

addEvent(document, 'keypress', onkeypress);

function onTextFromClipboard(e) {
    if (!is.isText) return;
    var pastedText = undefined;
    if (window.clipboardData && window.clipboardData.getData) { // IE
        pastedText = window.clipboardData.getData('Text');
    } else if (e.clipboardData && e.clipboardData.getData) {
        pastedText = e.clipboardData.getData('text/plain');
    }
    if (pastedText && pastedText.length) {
        textHandler.writeText(pastedText);
    }
}

addEvent(document, 'paste', onTextFromClipboard);
