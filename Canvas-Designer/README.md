# [Canvas Designer](https://github.com/muaz-khan/Canvas-Designer) / [Demo](https://www.webrtc-experiment.com/Canvas-Designer/)

"Collaborative" [Canvas Designer](https://github.com/muaz-khan/Canvas-Designer) i.e. Canvas-Drawing tool allows you draw bezier/quadratic curves, rectangles, circles and lines. You can also set strokes, back/forth colors and much more. You can draw using pencils, erase drawing, type texts etc.

This speciality of this drawing-tool is that, it generates Canvas2D code for you; so simply draw and get the code!

Also, you can collaborate your drawing with up to 15 users; and everything is synced from all users. So, if you draw a line and your friend-A draws quadratic curve and friend-B draws rectangle then everything will be synced among all users!

# [Click to view Gif Presentation](https://cdn.webrtc-experiment.com/images/Canvas-Designer.gif)

<img src="https://i.imgur.com/uDbfy1F.png" />

# How to Use

<ol>
    <li>Take all code from <a href="https://github.com/muaz-khan/Canvas-Designer">this link</a> and upload somewhere on your site.</li>
    <li>Target directly will be having this file: <a href="https://github.com/muaz-khan/Canvas-Designer/blob/master/canvas-designer-widget.js">canvas-designer-widget.js</a>. Link this file in your HTML/PHP page.</li>
    <li>
        Use this command to append widget in your HTML page:<br>
            
        <code>CanvasDesigner.appendTo(document.documentElement);</code>
    </li>
</ol>

# Complete Usage

```javascript
websocket.onmessage = function(event) {
    CanvasDesigner.syncData( JSON.parse(event.data) );
};

CanvasDesigner.addSyncListener(function(data) {
    websocket.send(JSON.stringify(data));
});

CanvasDesigner.setSelected('pencil');

CanvasDesigner.setTools({
    pencil: true,
    text: true
});

CanvasDesigner.appendTo(document.documentElement);
```

It is having `CanvasDesigner.destroy()` method as well.

# Use [WebRTC](http://www.rtcmulticonnection.org/docs/)!

```javascript
webrtc.onmessage = function(event) {
    CanvasDesigner.syncData( event.data );
};

CanvasDesigner.addSyncListener(function(data) {
    webrtc.send(data);
});
```

# Use Socket.io

```javascript
socket.on('message', function(data) {
    CanvasDesigner.syncData( data );
});

CanvasDesigner.addSyncListener(function(data) {
    socket.emit('message', data);
});
```

# Links

1. https://www.webrtc-experiment.com/Canvas-Designer/
2. https://github.com/muaz-khan/Canvas-Designer
3. https://canvas-designer.appspot.com/

Original source-code was shared 2-years back, here: https://github.com/muaz-khan/Everything/tree/gh-pages/Canvas/Tools/Designer

There is a similar "tinny" tool, however it isn't yet supporting collaboration: https://canvature.appspot.com/

And WebRTC-Experiments! https://github.com/muaz-khan/WebRTC-Experiment

# License

[Canvas Designer](https://github.com/muaz-khan/Canvas-Designer) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
