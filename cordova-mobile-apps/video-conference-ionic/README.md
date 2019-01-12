# ionic Video Conferencing / [online demo](https://rtcmulticonnection.herokuapp.com/demos/Video-Conferencing.html) / [install from appstore](https://play.google.com/store/apps/details?id=com.ionic.conference)

| File        | Explanation |
| ------------- |-------------|
| [`src/pages/home/home.ts`](https://github.com/muaz-khan/cordova-mobile-apps/tree/master/video-conference-ionic/src/pages/home/home.ts) | js code |
| [`src/pages/home/home.html`](https://github.com/muaz-khan/cordova-mobile-apps/tree/master/video-conference-ionic/src/pages/home/home.html) | html code |
| [`src/pages/home/home.scss`](https://github.com/muaz-khan/cordova-mobile-apps/tree/master/video-conference-ionic/src/pages/home/home.scss) | css code |

```sh
npm install --save-dev
```

# First Step, Modify `config.xml`

```xml
<widget id="com.yourdomain" version="1.0.0">
```

# Second Step, Install Platforms

```sh
# android
cordova platform add android@latest

# or ios
cordova platform add ios@latest
```

# Third Step, Install Plugins

Install all plugins as you can see in the `config.xml`.

# Fourth and Last Step, Build APK

```sh
ionic cordova build android

# run a localhost server
ionic serve
```

# License

[All Cordova Mobile Apps](https://github.com/muaz-khan/cordova-mobile-apps) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
