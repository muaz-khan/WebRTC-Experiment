# Video Conferencing / [online demo](https://rtcmulticonnection.herokuapp.com/demos/Video-Conferencing.html) / [install from appstore](https://play.google.com/store/apps/details?id=rmc3.videoconference)

APK files and other source codes can be found here:

* https://webrtcweb.com/cordova-apps/video-conferencing/

# First of All:

```sh
npm install --save-dev
```

# First Step, Modify `config.xml`

```xml
<widget id="com.yourdomain" version="1.0.0">
```

# Second Step, Install Platforms

``sh
# android
cordova platform add android@6.3.0

# or ios
cordova platform add ios@4.4.0
```

# Third Step, Install Plugins

```sh
cordova plugin install cordova-plugin-whitelist
cordova plugin install cordova-plugin-statusbar
cordova plugin install cordova-plugin-device
cordova plugin install cordova-plugin-android-permissions

# if you want to download images or files
cordova plugin add https://github.com/devgeeks/Canvas2ImagePlugin.git
```

# Fourth Step, Build APK

```sh
cordova build android
```

# Fifth Step, Modify `AndroidManifest`

Path: `./platforms/android/AndroidManifest`

Find `<uses-sdk` and paste following code quickly after that line:

```xml
<uses-sdk android:minSdkVersion="16" android:targetSdkVersion="26" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.MICROPHONE" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

# Six Step, Build APK Again

```sh
cordova build android
```

Now install APK on your android device.

For more info, please check:

* [docs/ios-android.md](https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/ios-android.md)

# License

[All Cordova Mobile Apps](https://github.com/muaz-khan/cordova-mobile-apps) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
