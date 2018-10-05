# iOS and Android

> Note: RTCMultiConnection supports Safari-11 browser both on iOS and MacOSX.
> 
> So you do not need to build a cordova or ionic application.

Please check these docs as well:

* [Write iOS apps using RTCMultiConnection](http://www.rtcmulticonnection.org/docs/Write-iOS-Apps/)
* [Write Android apps using RTCMultiConnection](http://www.rtcmulticonnection.org/docs/Write-Android-Apps/)

----

## iPhone, iPad, Nexus, Samsung, many other devices

> This page explains how to write iOS+Android phonegap/cordova applications for RTCMultiConnection.

# Cordova Demos

Please check all iOS+Android demos here:

* https://webrtcweb.com/cordova-apps/

| DemoTitle        | DownloadZip           | AndroidAPK | AllFiles |
| ------------- |-------------|-------------|-------------|
| Scalable Broadcast | [Source](https://webrtcweb.com/cordova-apps/scalable-broadcast/Download-Source.zip) | [Android APK](https://webrtcweb.com/cordova-apps/scalable-broadcast/Install-Android-App.apk) | [All files](https://webrtcweb.com/cordova-apps/scalable-broadcast) |
| Audio Conferencing | [Source](https://webrtcweb.com/cordova-apps/audio-conferencing/Download-Source.zip) | [Android APK](https://webrtcweb.com/cordova-apps/audio-conferencing/Install-Android-App.apk) | [All files](https://webrtcweb.com/cordova-apps/audio-conferencing) |
| Video Conferencing | [Source](https://webrtcweb.com/cordova-apps/video-conferencing/Download-Source.zip) | [Android APK](https://webrtcweb.com/cordova-apps/video-conferencing/Install-Android-App.apk) | [All files](https://webrtcweb.com/cordova-apps/video-conferencing) |
| File Sharing | [Source](https://webrtcweb.com/cordova-apps/filesharing/Download-Source.zip) | [Android APK](https://webrtcweb.com/cordova-apps/filesharing/Install-Android-App.apk) | [All files](https://webrtcweb.com/cordova-apps/filesharing) |

# Prerequisites

1. xcode `latest`
2. cordova android plugin `latest`
3. cordova ios plugin `latest`

Check xcode-build-version: `xcodebuild -version`

* https://cordova.apache.org/docs/en/latest/guide/platforms/ios/

Make sure that terminal is using latest xcode:

```
xcode-select --print-path

# maybe [sudo]
xcode-select -switch /Applications/Xcode5.1.1/Xcode.app
```

# Install Prerequisites

```sh
# if a command fails, try with [sudo]

npm install cordova -g
npm install xcode -g
```

# Create Your First App

```sh
cordova create ./yourAppName org.yourAppName yourAppName
cd yourAppName
```

## Add WebRTC plugin for iOS apps

```sh
cordova plugin add cordova-plugin-iosrtc
```

Now compile SWIFT parameters:

```sh
cd hooks
wget https://raw.githubusercontent.com/eface2face/cordova-plugin-iosrtc/master/extra/hooks/iosrtc-swift-support.js

# maybe [sudo]
chmod +x iosrtc-swift-support.js

cd ..
```

Now modify `config.xml` for this section:

```xml
<platform name="ios">
    <hook type="after_platform_add" src="hooks/iosrtc-swift-support.js" />
</platform>
```

# Add Platforms

Now add platforms. If you already added, please remove all existing platforms, and add them again. Otherwise, you'll see errors during `cordova build ios` or `cordova build android`:

> Note: Do same if you change your app's name in the "config.xml" file. Make sure to remove and re-add all platforms.

```sh
# remove any existing platform
cordova platform remove ios
cordova platform remove android

# add latest platform versions
cordova platform add ios
cordova platform add android
```

# Build your Apps

```sh
cordova build ios
cordova build android
```

Now open `platforms/ios/ProjectName.xcodeproj". It may ask this:

> "Convert to Latest Swift Syntax?"

Simply click `Cancel` button. We're OK with old syntax.

# `config.xml` hints

Modify `platform/android/AndroidManifest.xml` for `<uses-permission android:name="android.permission.CAMERA"/>` and a few others. Now getUserMedia API will work in Android.

An example `AndroidManifest.xml` file:

```xml
<?xml version='1.0' encoding='utf-8'?>
<manifest android:hardwareAccelerated="true" android:versionCode="30001" android:versionName="3.0.1" package="rmc3.videoconference" xmlns:android="http://schemas.android.com/apk/res/android">
    <supports-screens android:anyDensity="true" android:largeScreens="true" android:normalScreens="true" android:resizeable="true" android:smallScreens="true" android:xlargeScreens="true" />
    <uses-permission android:name="android.permission.INTERNET" />
    <application android:hardwareAccelerated="true" android:icon="@mipmap/icon" android:label="@string/app_name" android:supportsRtl="true">
        <activity android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale" android:label="@string/activity_name" android:launchMode="singleTop" android:name="MainActivity" android:theme="@android:style/Theme.DeviceDefault.NoActionBar" android:windowSoftInputMode="adjustResize">
            <intent-filter android:label="@string/launcher_name">
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
    <uses-sdk android:minSdkVersion="16" android:targetSdkVersion="24" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.MICROPHONE" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
</manifest>
```

An example `config.xml` file (make sure that `icon.png` has valid path):

```xml
<?xml version='1.0' encoding='utf-8'?>
<widget id="rmc3.videoconference" version="3.0.2" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>Video Conferencing</name>
    <icon src="www/img/icon.png" />
    <description>
        Peer-to-Peer Application
    </description>
    <author email="muazkh@gmail.com" href="https://www.webrtc-experiment.com/">
        Muaz khan
    </author>
    <content src="index.html" />
    
    <allow-navigation href="*" />
    <allow-intent href="*" />
    <access origin="*" />

    <platform name="android">
        <preference name="Orientation" value="default" />
        <preference name="KeepRunning" value="true" />
        <preference name="AndroidLaunchMode" value="singleTop" />
    </platform>
    <platform name="ios">
        <preference name="Orientation" value="all" />
        <hook src="hooks/iosrtc-swift-support.js" type="after_platform_add" />

        <config-file parent="CFBundleURLTypes" target="*-Info.plist">
            <array>
                <key>NSAppTransportSecurity</key>
                <dict>
                    <key>NSAllowsArbitraryLoads</key>
                    <true />
                </dict>
            </array>
        </config-file>

        <config-file parent="NSCameraUsageDescription" target="*-Info.plist" platform="ios">
            <string>WebRTC uses your camera to make video calls.</string>
        </config-file>

        <config-file parent="NSMicrophoneUsageDescription" target="*-Info.plist" platform="ios">
            <string>WebRTC uses your microphone to make voice calls.</string>
        </config-file>
    </platform>

    <plugin name="cordova-plugin-whitelist" spec="latest" />
    <plugin name="cordova-plugin-iosrtc" spec="latest" />
    <plugin name="cordova-plugin-device" spec="latest" />
    <plugin name="cordova-plugin-crosswalk-webview" spec="latest" />
</widget>
```

# Use RTCMultiConnection

> This section explains how to integrate RTCMultiConnection for both iOS and Android apps.

Download and link [`RTCMultiConnection.js`](https://github.com/muaz-khan/RTCMultiConnection/tree/master/dist/RTCMultiConnection.js):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>CordovaApp using RTCMultiConnection</title>
    <link rel="stylesheet" href="css/index.css">
</head>
<body>
    <!-- your UI code -->

    <script src="cordova.js"></script>
    <script src="js/socket.io.js"></script>
    <script src="js/RTCMultiConnection.js"></script>
    <script src="js/index.js"></script>
</body>
</html>
```

`www/js/index.js`:


```javascript
// please read below comments:
document.addEventListener('deviceready', function() {
    // you can put your custom-ui-codes here
    // e.g.
    // var connection = new RTCMultiConnection();
}, false);
```

# Select Speakers as default audio output device on iOS

```javascript
window.iOSDefaultAudioOutputDevice = 'speaker'; // earpiece or speaker

// set above line, before below one
var connection = new RTCMultiConnection();
```

# Other Documents

1. [Getting Started guide for RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/getting-started.md)
2. [Installation Guide](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/installation-guide.md)
3. [How to Use?](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/how-to-use.md)
4. [API Reference](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/api.md)
5. [Upgrade from v2 to v3](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/upgrade.md)
6. [How to write iOS/Android applications?](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/ios-android.md)
7. [Tips & Tricks](https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/tips-tricks.md)

## Twitter

* https://twitter.com/WebRTCWeb i.e. @WebRTCWeb

## License

[RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection) is released under [MIT licence](https://github.com/muaz-khan/RTCMultiConnection/blob/master/LICENSE.md) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
