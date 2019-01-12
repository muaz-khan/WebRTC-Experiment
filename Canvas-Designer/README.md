# [Canvas Designer](https://github.com/muaz-khan/Canvas-Designer) / [API Referencee](https://github.com/muaz-khan/Canvas-Designer#api-reference)

## Demo: https://www.webrtc-experiment.com/Canvas-Designer/

## Advance Demo: [demos/dashboard/](https://rtcmulticonnection.herokuapp.com/demos/dashboard/)

Multiple designers demo: https://www.webrtc-experiment.com/Canvas-Designer/multiple.html

### YouTube video:

* https://www.youtube.com/watch?v=pvAj5l_v3cM

[![npm](https://img.shields.io/npm/v/canvas-designer.svg)](https://npmjs.org/package/canvas-designer) [![downloads](https://img.shields.io/npm/dm/canvas-designer.svg)](https://npmjs.org/package/canvas-designer) [![Build Status: Linux](https://travis-ci.org/muaz-khan/Canvas-Designer.png?branch=master)](https://travis-ci.org/muaz-khan/Canvas-Designer)

> "Collaborative" [Canvas Designer](https://github.com/muaz-khan/Canvas-Designer) i.e. Canvas-Drawing tool allows you draw bezier/quadratic curves, rectangles, circles and lines. You can also set strokes, back/forth colors and much more. You can draw using pencils, erase drawing, type texts etc. You can [easily add your own tools](https://www.webrtc-experiment.com/Canvas-Designer/Help/#contribute).

**You can check all releases here:**

* https://github.com/muaz-khan/Canvas-Designer/releases

The specialty of this drawing-tool is that, it generates Canvas2D code for you; so simply draw and get the code! That code can be used in any javascript Canvas2D application.

**You can submit issues here:**

* https://github.com/muaz-khan/Canvas-Designer/issues

Also, you can collaborate your drawing with up to 15 users; and everything is synced from all users. So, if you draw a line and your friend-A draws quadratic curve and friend-B draws rectangle then everything will be synced among all users!

### Youtube Videos

* https://www.youtube.com/watch?v=oSSwMlBu8SY

Gif images:

* https://cdn.webrtc-experiment.com/images/Canvas-Designer.gif

<img src="https://i.imgur.com/uDbfy1F.png" />

# Built-in tools

You can use [`designer.setSelected`](https://github.com/muaz-khan/Canvas-Designer#setselected) or [`designer.setTools`](https://github.com/muaz-khan/Canvas-Designer#settools) for below tools.

1. `line` --- to draw straight lines
2. `pencil` --- to write/draw shapes
3. `dragSingle` --- to drag/ove and especially **resize** last selected shape
4. `dragMultiple` --- to drag/move all shapes
5. `eraser` --- to erase/clear specific portion of shapes
6. `rectangle` --- to draw rectangles
7. `arc` --- to draw circles
8. `bezier` --- to draw bezier curves
9. `quadratic` --- to draw quadratic curves
10. `text` --- to write texts on single or multiple lines, select font families/sizes and more
11. `image` --- add external images
12. `arrow` --- draw arrow lines
13. `marker` --- draw markers
14. `lineWidth` --- set line width
15. `colorsPicker` --- background and foreground colors picker
16. `extraOptions` --- extra options eg. lineCap, lineJoin, globalAlpha, globalCompositeOperation etc.
17. `pdf` --- to import PDF
18. `code` --- to enable/disable code view
19. `undo` --- undo recent shapes

The correct name for `dragSingle` should be: `drag-move-resize last-selected-shape`.

The correct name for `dragMultiple` should be: `drag-move all-shapes`.

### Upcoming tools

1. Allow users to add video-streams or screen-streams or existing-webm-mp4-videos
2. Resize all shapes at once (currently you can resize last selected shape only)

# Features

1. Draw single or multiple shapes of any kind (according to toolbox)
2. Drag/resize/adjust all the shapes in any possible direction
3. Rectangles and images can be resized in 4-directions

   Red transparent small circles helps you understand how to resize.

4. Undo drawings using `ctrl+z` keys (undo all shapes, undo last 10 or specific shapes, undo range of shapes or undo last shape)
5. Drag/move single or all the shapes without affecting any single coordinate

More importantly, you can use unlimited designers on a single page. Each will have its own surface and its own tools.

# Chinese, Arabic, other languages

You can install following chrome extension for multi-language input tools:

* https://chrome.google.com/webstore/detail/google-input-tools/mclkkofklkfljcocdinagocijmpgbhab?hl=en

Now type your own language text in any `<input>` box or anywhere, and simply copy that text.

Now click `T` tool icon from the tool-box and press `ctrl+v` to paste your own language's text.

**To repeat it:**

1. Type your own language texts anywhere and make sure to copy to clipboard using `ctrl+v`
2. Then click `T` icon, and then press `ctrl+v` to paste your copied text

You can paste any text: English, Arabic, Chinese etc.

# How to Use

1. Download/link `canvas-designer-widget.js` from [this github repository](https://github.com/muaz-khan/Canvas-Designer).
2. Set `designer.widgetHtmlURL` and `designer.widgetJsURL` in your HTML file.
3. Use this command to append widget in your HTML page:

   `var designer = new CanvasDesigner();`

   `designer.appendTo(document.body);`

```html
<!-- 1st step -->
<script src="https://cdn.webrtc-experiment.com/Canvas-Designer/canvas-designer-widget.js"></script>

<!-- 2nd step -->
<script>
var designer = new CanvasDesigner();

// both links are mandatory
// widget.html will internally use widget.js
designer.widgetHtmlURL = 'https://cdn.webrtc-experiment.com/Canvas-Designer/widget.html'; // you can place this file anywhere
designer.widgetJsURL = 'https://cdn.webrtc-experiment.com/Canvas-Designer/widget.js';     // you can place this file anywhere
</script>

<!-- 3rd i.e. last step -->
<script>
// <iframe> will be appended to "document.body"
designer.appendTo(document.body || document.documentElement);
</script>
```

You can even download TAR:

```
mkdir Canvas-Designer && cd Canvas-Designer
wget http://dl.webrtc-experiment.com/canvas-designer.tar.gz
tar -zxvf canvas-designer.tar.gz
ls -a
```

* For windows, use 7Zip or WinRAR to extract this: [canvas-designer.tar.gz](http://dl.webrtc-experiment.com/canvas-designer.tar.gz)

# Complete Usage

```javascript
var designer = new CanvasDesigner();

websocket.onmessage = function(event) {
    designer.syncData( JSON.parse(event.data) );
};

designer.addSyncListener(function(data) {
    websocket.send(JSON.stringify(data));
});

designer.setSelected('pencil');

designer.setTools({
    pencil: true,
    text: true
});

designer.appendTo(document.documentElement);
```

It is having `designer.destroy()` method as well.

# Use [WebRTC](http://www.rtcmulticonnection.org/docs/)!

```javascript
webrtc.onmessage = function(event) {
    designer.syncData( event.data );
};

designer.addSyncListener(function(data) {
    webrtc.send(data);
});
```

# Use Socket.io

```javascript
socket.on('message', function(data) {
    designer.syncData( data );
});

designer.addSyncListener(function(data) {
    socket.emit('message', data);
});
```

# API Reference

## `widgetHtmlURL`

You can place `widget.html` file anywhere on your site.

```javascript
designer.widgetHtmlURL = '/html-files/widget.html';
```

By default `widget.html` is placed in the same directory of `index.html`.

```javascript
// here is default value
designer.widgetHtmlURL = 'widget.html';
```

Remember, `widget.html` is loaded using `<iframe>`.

## `widgetJsURL`

> **Note:** This file is **internally used** by `widget.html`.

You can place `widget.html` file anywhere on your site.

```javascript
designer.widgetJsURL = '/js-files/widget.min.js';
```

By default `widget.min.js` is placed in the same directory of `index.html`.

```javascript
// here is default value
designer.widgetJsURL = 'widget.min.js';
```

Remember, `widget.js` is loaded using `<iframe>`.

## `syncData`

Pass array-of-points that are shared by remote users using socket.io or websockets or XMPP or WebRTC.

```javascript
designer.syncData(arrayOfPoints);
```

## `clearCanvas`

Remove and clear all drawings from the canvas:

```javascript
designer.clearCanvas();
```

## `renderStream`

Call this method internally to fix video rendering issues.

```javascript
designer.renderStream();
```

## `addSyncListener`

This callback is invoked as soon as something new is drawn. An array-of-points is passed over this function. That array MUST be shared with remote users for collaboration.

```javascript
designer.addSyncListener(function(data) {
    designer.send(JSON.stringify(data));
});
```

## `setSelected`

This method allows you select specific tools.

* See list of [all tools](https://github.com/muaz-khan/Canvas-Designer#built-in-tools)

```javascript
designer.setSelected('rectangle');
```

## `setTools`

This method allows you choose between tools that **should be displayed** in the tools-panel.

* See list of [all tools](https://github.com/muaz-khan/Canvas-Designer#built-in-tools)

```javascript
designer.setTools({
    line: true,
    arrow: true,
    pencil: true,
    marker: true,
    dragSingle: true,
    dragMultiple: true,
    eraser: true,
    rectangle: true,
    arc: true,
    bezier: true,
    quadratic: true,
    text: true,
    image: true,
    pdf: true,
    zoom: true,
    lineWidth: true,
    colorsPicker: true,
    extraOptions: true,
    code: true,
    undo: true
});
```

## `icons`

You can force/set your own tool-icons:

```javascript
designer.icons = {
    line: '/icons/line.png',
    arrow: '/icons/arrow.png',
    pencil: '/icons/pencil.png',
    dragSingle: '/icons/dragSingle.png',
    dragMultiple: '/icons/dragMultiple.png',
    eraser: '/icons/eraser.png',
    rectangle: '/icons/rectangle.png',
    arc: '/icons/arc.png',
    bezier: '/icons/bezier.png',
    quadratic: '/icons/quadratic.png',
    text: '/icons/text.png',
    image: '/icons/image.png',
    pdf: '/icons/pdf.png',
    pdf_next: '/icons/pdf-next.png',
    pdf_prev: '/icons/pdf-prev.png',
    marker: '/icons/marker.png',
    zoom: '/icons/zoom.png',
    lineWidth: '/icons/lineWidth.png',
    colorsPicker: '/icons/colorsPicker.png',
    extraOptions: '/icons/extraOptions.png',
    code: '/icons/code.png'
};
```

You can set like this as well:

```javascript
designer.icons.line = '/icons/line.png';
```

Default values are `NULL` to force icons from `/dev/data-dris.js`.

## `appendTo`

CanvasDesigner is a widget; that widget should be appended to a DOM object. This method allows you pass `<body>` or any other HTMLDOMElement.

```javascript
designer.appendTo(document.body || document.documentElement);

// or
designer.appendTo(document.body || document.documentElement, function() {
    alert('iframe load callback');
});
```

The correct name for `appendTo` is: `append-iframe to target HTML-DOM-element`

## `destroy`

If you want to remove the widget from your HTMLDOMElement.

```javascript
designer.destroy();
```

## `iframe`

You can access designer iframe as following:

```javascript
designer.iframe.style.border = '5px solid red';

window.open(designer.iframe.src);
```

`designer.iframe` will be `null/undefined` until you call `appendTo`. So always use this code-block:

```javascript
if(!designer.iframe) {
    designer.appendTo(document.body);
}
designer.iframe.style.border = '5px solid red';
```

## `toDataURL`

Get data-URL of your drawings!

```javascript
designer.toDataURL('image/png', function(dataURL) {
    window.open(dataURL);
});
```

## `sync`

You can manually sync drawings by invoking `designer.sync` method:

```javascript
designer.sync();
```

Here is a real usecase:

```javascript
webrtcDataChannel.onopen = function() {
    if(designer.pointsLength > 0) {
        // you seems having data to be synced with new user!
        designer.sync();
    }
};
```

## `captureStream`

Get `MediaStream` object and share in realtime using `RTCPeerConnection.addStream` API.

```html
<script src="dev/webrtc-handler.js"></script>
<script>
designer.captureStream(function(stream) {
    var url = URL.createObjectURL(stream);
    videoPreview.src = url;

    rtcPeerConnection.addStream(stream);
    rtcPeerConnection.createOffer(success, failure, params);
});
</script>
```

## `pointsLength`

Each shape is considered as a `point`. This value allows you check number of shapes that are already drawn on the canvas-designer.

```javascript
(function looper() {
    document.getElementById('number-of-shapes').inenrHTML = designer.pointsLength;
    setTimeout(looper, 1000);
})();
```

Or a real usage:

```javascript
websocket.onopen = function() {
    if(designer.pointsLength > 0) {
        // you seems having data to be synced with existing users!
        designer.sync();
    }
};
```

## `undo`

You can either undo drawings by pressing `ctrl+z` on windows and `command+z` on Mac; however you can undo using `designer.undo` method as well:

```javascript
designer.undo();   // undo last shape
designer.undo(-1); // undo last shape

// undo shape from specific index
designer.undo(0);

// undo all shapes
designer.undo('all');

// undo last 10 shapes
designer.undo({
    numberOfLastShapes: 10
})
```

`designer.pointsLength` shows number of shapes; and `designer.undo` accepts shape-index as well.

<h2 align="center">Add New Tools</h2>

## First Step

Open [`widget.html`](https://github.com/muaz-khan/Canvas-Designer/blob/master/widget.html) and add your new tool-icon HTML.

```html
<div id="tool-box" class="tool-box"> <!-- search for this div; and include your HTML inside this div -->
    <canvas id="yourNewToolIcon" width="40" height="40"></canvas> <!-- here is your icon-HTML -->
</div>
```

## Second Step

Open [`decorator.js`](https://github.com/muaz-khan/Canvas-Designer/blob/master/dev/decorator.js) and decorate your new HTML icon.

```javascript
var tools = {
    yourNewToolIcon: true // add this line to make sure index.html can use it
};
```

Search for `decorateLine` method, and append following snippet quickly after that method:

```javascript
function decorateYourNewToolIcon() {
    var context = getContext('yourNewToolIcon');

    context.fillStyle = 'Gray';
    context.font = '9px Verdana';
    context.fillText('New', 16, 12);

    bindEvent(context, 'YourNewToolIconSelected');
}

if (tools.yourNewToolIcon === true) {
    decorateYourNewToolIcon();
} else document.getElementById('yourNewToolIcon').style.display = 'none';
```

## Third Step

Open [`common.js`](https://github.com/muaz-khan/Canvas-Designer/blob/master/dev/common.js) and add selection-states for your new tool-icon (i.e. whether your new tool icon is selected or not):

```javascript
var is = {
    isYourNewToolIconSelected: false, // add this line

    set: function (shape) {
        var cache = this;

        cache.isYourNewToolIconSelected = false; // add this line as well.

        // ..... don't modify anything else
        cache['is' + shape] = true;
    }
};
```

You merely need to set `isYourNewToolIconSelected:true` also `cache.isYourNewToolIconSelected=false`.

## Fourth Step

Create new file in the [`dev`](https://github.com/muaz-khan/Canvas-Designer/tree/master/dev) directory. Name this file as `yourNewToolIcon-handler.js`.

This file MUST look like this:

```javascript
var yourNewToolIconHandler = {
    ismousedown: false,

    mousedown: function(e) {
        this.ismousedown = true;
    },

    mouseup: function(e) {
        this.ismousedown = false;
    },

    mousemove: function(e) {
        if(this.ismousedown) { ... }
    }
};
```

You can check other `*-handler.js` from [`dev`](https://github.com/muaz-khan/Canvas-Designer/tree/master/dev) directory to get the idea how exactly it works.

Now open [`Gruntfile.js#L43`](https://github.com/muaz-khan/Canvas-Designer/blob/master/Gruntfile.js#L43) and add link to your new file: `dev/events-handler.js`.

Now compile all your changes using `grunt`.

## Fifth Step

Open [`events-handler.js`](https://github.com/muaz-khan/Canvas-Designer/blob/master/dev/events-handler.js) and make sure that your above `yourNewToolIconHandler` object is called for mouse up/down/move events.

```javascript
addEvent(canvas, isTouch ? 'touchstart' : 'mousedown', function (e) {

    // you merely need to add this line at the end of this method
    else if (is.isYourNewToolIconSelected) yourNewToolIconHandler.mousedown(e);
});

addEvent(document, isTouch ? 'touchend' : 'mouseup', function (e) {

    // you merely need to add this line at the end of this method
    else if (is.isYourNewToolIconSelected) yourNewToolIconHandler.mouseup(e);
});

addEvent(canvas, isTouch ? 'touchmove' : 'mousemove', function (e) {

    // you merely need to add this line at the end of this method
    else if (is.isYourNewToolIconSelected) yourNewToolIconHandler.mousemove(e);
});
```

First of all, we are checking whether your tool-icon is selected or not: `is.isYourNewToolIconSelected`

Then we are calling `yourNewToolIconHandler` dot `mousedown/mouseup/mousemove` events respectively.

## Sixth Step

Open [`draw-helper.js`](https://github.com/muaz-khan/Canvas-Designer/blob/master/dev/draw-helper.js). Make sure that your new tool-icon can be drawn on the `<canvas>` surface.

```javascript
yourNewToolIcon: function(context, point, options) {
    context.beginPath();
    context.moveTo(point[0], point[1]);
    context.whateverYouWantToDoHere(point[2], point[3]);

    this.handleOptions(context, options);
}
```

Usually `point[0]` is `x` coordinates; `point[1]` is `y` coordinates; `point[2]` is `width` and `point[3]` is `height`.

Different shapes can handle these points differently.

There is NO-limit for `point[index]`. You can add as many points as you want.

Complex shapes can add 10 or 20 points.

## Seventh Step

Open [`drag-helper.js`](https://github.com/muaz-khan/Canvas-Designer/blob/master/dev/drag-helper.js) and make sure that your new shape can be dragged/resized/move.

Search for `p[0] === 'line'` and add similar code-blocks for your shape (new-tool-icon) as well.

## Eighth Step

Open [`common.js`](https://github.com/muaz-khan/Canvas-Designer/blob/master/dev/common.js) and make sure that your new shape (tool-icon) is printed on the `<textarea>` as well.

This allows end-users to copy your shape's code and use anywhere on their own web-pages.

Open [`common.js`](https://github.com/muaz-khan/Canvas-Designer/blob/master/dev/common.js) file; there is a function [`updateTextArea`](https://github.com/muaz-khan/Canvas-Designer/blob/master/dev/common.js#L67) inside the "common" object – which is aimed to output into textarea element.

You don't have to change [`updateTextArea`](https://github.com/muaz-khan/Canvas-Designer/blob/master/dev/common.js#L67). For simplicity purpose, code is separated in different functions/properties that you've to edit:

1. [`forLoop`](https://github.com/muaz-khan/Canvas-Designer/blob/master/dev/common.js#L363)
2. [`absoluteNOTShortened`](https://github.com/muaz-khan/Canvas-Designer/blob/master/dev/common.js#L105)
3. [`relativeShortened`](https://github.com/muaz-khan/Canvas-Designer/blob/master/dev/common.js#L158)
4. [`relativeNOTShortened`](https://github.com/muaz-khan/Canvas-Designer/blob/master/dev/common.js#L281)

Search for `p[0] === 'line'` and add similar code-blocks for your shape (new-tool-icon) as well.

### For more information

* https://www.webrtc-experiment.com/Canvas-Designer/Help/#contribute


# Shortcut Keys

```
ctrl+t (to display text-fonts box)
ctrl+z (to undo last-single shape)
ctrl+a (to select all shapes)
ctrl+c (copy last-selected shape)
ctrl+v (paste last-copied shape)
```

`ctrl+mousedown` allows you quickly copy/paste all shapes. (i.e. ctrl button + mouse down)

# Signaling Server

You need only these two files:

1. [server.js](https://github.com/muaz-khan/RTCMultiConnection/blob/master/server.js)
2. [Signaling-Server.js](https://github.com/muaz-khan/RTCMultiConnection/blob/master/Signaling-Server.js)

You also need to manually install `socket.io`:

```sh
wget https://raw.githubusercontent.com/muaz-khan/RTCMultiConnection/master/server.js
wget https://raw.githubusercontent.com/muaz-khan/RTCMultiConnection/master/Signaling-Server.js
npm install socket.io --save-dev
node server --port=9002 --ssl --ssl_key=/home/ssl/ssl.key --ssl_cert=/home/ssl/ssl.crt
```

For more info:

* https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/installation-guide.md

# Contributors

1. [Muaz Khan](https://github.com/muaz-khan)
2. [Oleg Aliullov](https://github.com/rashidovich2)

Please make pull-request to update this list.

# License

[Canvas Designer](https://github.com/muaz-khan/Canvas-Designer) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com).
