# Enable Screen Capturing using [Firefox Extensions API](https://github.com/muaz-khan/Firefox-Extensions)

Enable screen capturing using Firefox (for https://www.webrtc-experiment.com demos only):

* [enable-screen-capturing.xpi](https://www.webrtc-experiment.com/store/firefox-extension/enable-screen-capturing.xpi)

To use in your own domains:

Modify `bootstrap.js` file, line 18:

```javascript
['yourDomain.com', 'www.yourDomain.com'].forEach(function(domain) {
    if (values.indexOf(domain) === -1) {
        values.push(domain);
        addon_domains.push(domain);
    }
});
```

And modify `install.rdf` for you extension information (name, URL, icon etc.)

## Credits

[Muaz Khan](https://github.com/muaz-khan):

1. Personal Webpage: http://www.muazkhan.com
2. Email: muazkh@gmail.com
3. Twitter: https://twitter.com/muazkh and https://twitter.com/WebRTCWeb
4. Google+: https://plus.google.com/+WebRTC-Experiment

## License

[Firefox-Extensions](https://github.com/muaz-khan/Firefox-Extensions) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
