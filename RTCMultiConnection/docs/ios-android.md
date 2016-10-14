# iOS and Android

Please check these docs instead:

# 1) [Write iOS apps using RTCMultiConnection](http://www.rtcmulticonnection.org/docs/Write-iOS-Apps/)

# 2) [Write Android apps using RTCMultiConnection](http://www.rtcmulticonnection.org/docs/Write-Android-Apps/)

----

## iPhone, iPad, Nexus, Blackberry, Samsung, many other devices

> This page explains how to write iOS+Android phonegap/cordova applications for RTCMultiConnection-v3.

# Cordova Demos

| DemoTitle        | DownloadZip           | AndroidAPK | AllFiles |
| ------------- |-------------|-------------|-------------|
| Scalable Broadcast | [Source](http://dl.webrtc-experiment.com/cordova-apps/scalable-broadcast/Download-Source.zip) | [Android APK](http://dl.webrtc-experiment.com/cordova-apps/scalable-broadcast/Install-Android-App.apk) | [All files](http://dl.webrtc-experiment.com/cordova-apps/scalable-broadcast) |
| Audio Conferencing | [Source](http://dl.webrtc-experiment.com/cordova-apps/audio-conferencing/Download-Source.zip) | [Android APK](http://dl.webrtc-experiment.com/cordova-apps/audio-conferencing/Install-Android-App.apk) | [All files](http://dl.webrtc-experiment.com/cordova-apps/audio-conferencing) |
| Video Conferencing | [Source](http://dl.webrtc-experiment.com/cordova-apps/video-conferencing/Download-Source.zip) | [Android APK](http://dl.webrtc-experiment.com/cordova-apps/video-conferencing/Install-Android-App.apk) | [All files](http://dl.webrtc-experiment.com/cordova-apps/video-conferencing) |
| File Sharing | [Source](http://dl.webrtc-experiment.com/cordova-apps/filesharing/Download-Source.zip) | [Android APK](http://dl.webrtc-experiment.com/cordova-apps/filesharing/Install-Android-App.apk) | [All files](http://dl.webrtc-experiment.com/cordova-apps/filesharing) |

# Prerequisites

1. xcode `7.2.1` (required)
2. cordova android plugin `5.1.0` (suggested)
3. cordova ios plugin `3.9.2` --- note: MUST be this version (don't use newer ones)

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

# add specific/working platform versions
cordova platform add ios@3.9.2
cordova platform add android@5.1.0
```

> NOTE: NOTE: NOTE: NOTE:
>
> Following LINE is VERY_VERY important:
>
> `cordova platform add ios@3.9.2`
>
> Make sure to install iOS package version 3.9.2. NEVER install any newer version.

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
<manifest android:hardwareAccelerated="true" android:versionCode="1" android:versionName="0.0.1" package="com.yourApp" xmlns:android="http://schemas.android.com/apk/res/android">
    <supports-screens android:anyDensity="true" android:largeScreens="true" android:normalScreens="true" android:resizeable="true" android:smallScreens="true" android:xlargeScreens="true" />
    <application android:hardwareAccelerated="true" android:icon="@drawable/icon" android:label="@string/app_name" android:supportsRtl="true">
        <activity android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale" android:label="@string/activity_name" android:launchMode="singleTop" android:name="MainActivity" android:theme="@android:style/Theme.DeviceDefault.NoActionBar" android:windowSoftInputMode="adjustResize">
            <intent-filter android:label="@string/launcher_name">
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
    <uses-sdk android:minSdkVersion="14" android:targetSdkVersion="23" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.WRITE_CONTACTS" />
    <uses-permission android:name="android.permission.GET_ACCOUNTS" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.MICROPHONE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
</manifest>
```

An example `config.xml` file (make sure that `icon.png` has valid path):

```xml
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.yourApp" version="0.0.1" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>yourApp</name>
    <icon src="www/icon.png" />
    <description>yourApp</description>
    <author email="yourApp@gmail.com" href="http://www.yourApp.com">You</author>
    <content src="index.html" />
    <plugin name="cordova-plugin-whitelist" spec="1" />
    <access uri="*" subdomains="true" origin="*" />
    <allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    <allow-intent href="tel:*" />
    <allow-intent href="sms:*" />
    <allow-intent href="mailto:*" />
    <allow-intent href="geo:*" />
    <allow-navigation href="https://*/*" />
    <platform name="android">
        <allow-intent href="market:*" />
    </platform>
    <platform name="ios">
        <allow-intent href="itms:*" />
        <allow-intent href="itms-apps:*" />
        <hook type="after_platform_add" src="hooks/iosrtc-swift-support.js" />
        <config-file target="*-Info.plist" parent="CFBundleURLTypes">
            <array>
                <key>NSAppTransportSecurity</key>
                <dict><key>NSAllowsArbitraryLoads</key><true/></dict>
            </array>
        </config-file>
    </platform>
    <preference name="xwalkVersion" value="16+" />
    <preference name="xwalkCommandLine" value="--disable-pull-to-refresh-effect --allow-file-access-from-files --disable-web-security" />
    <preference name="xwalkMode" value="embedded" />
    <preference name="xwalkMultipleApk" value="true" />
    <preference name="BackgroundColor" value="0xFFFF0000" />
    <preference name="xwalkUserAgent" value="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36" />
    <preference name="AndroidPersistentFileLocation" value="Internal" />
</widget>
```

# Use RTCMultiConnection-v3

> This section explains how to integrate RTCMultiConnection-v3 for both iOS and Android apps.

Copy/paste entire [`rmc3.min.js`](https://github.com/muaz-khan/RTCMultiConnection/tree/master/dist/rmc3.min.js) file inside `deviceready` callback:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>CordovaApp using RTCMultiConnection-v3</title>
    <link rel="stylesheet" href="css/index.css">
</head>
<body>
    <!-- your UI code -->

    <!-- scripts are placed on footer -->
    <script src="cordova.js"></script>

    <!-- NEVER link rmc3.min.js here -->
    <!-- instead copy/paste code from rmc3.min.js into below "index.js" file -->
    <script src="js/index.js"></script>
</body>
</html>
```

`www/js/index.js`:


```javascript
// please read below comments:
document.addEventListener('deviceready', function() {
    // copy/paste entire/all code from "rmc3.min.js" file
    // here --- exact here
    // paste inside this callback
    // if you will NOT do this, RTCMultiConnection will fail on cordova-based apps
    // again, you MUST NOT link rmc3.min.js
    // instead copy/paste all the codes here

    // you can put your custom-ui-codes here
    // e.g.
    // var connection = new RTCMultiConnection({useDefaultDevices:true});
}, false);
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
