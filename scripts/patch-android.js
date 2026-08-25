/**
 * patch-android.js
 *
 * `npx cap add android` generates a fresh android/ project from
 * Capacitor's default template every time — it does NOT know about
 * our custom MainActivity.java (volume-key intercept) or the camera
 * permissions we need. This script re-applies both after generation.
 *
 * Run this AFTER `npx cap add android` (and after `npx cap sync
 * android`, which only touches web assets/plugins, not this file or
 * the manifest permissions below).
 */

const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const config = require(path.join(rootDir, "capacitor.config.json"));

const appId = config.appId;

if (!appId) {
    console.error("capacitor.config.json is missing \"appId\" — cannot continue.");
    process.exit(1);
}

const packagePath = appId.split(".").join("/");


/* =========================================
   1. Copy our custom MainActivity.java into
      the generated package folder.
========================================= */

const mainActivitySrc = path.join(rootDir, "android-patches", "MainActivity.java");
const mainActivityDestDir = path.join(
    rootDir, "android", "app", "src", "main", "java", packagePath
);
const mainActivityDest = path.join(mainActivityDestDir, "MainActivity.java");

if (!fs.existsSync(mainActivityDestDir)) {
    console.error(
        "Expected generated package folder not found:\n  " + mainActivityDestDir +
        "\nDid \"npx cap add android\" run first, and does the appId in " +
        "capacitor.config.json (" + appId + ") match?"
    );
    process.exit(1);
}

fs.copyFileSync(mainActivitySrc, mainActivityDest);
console.log("[patch-android] Copied MainActivity.java -> " + mainActivityDest);


/* =========================================
   2. Insert camera permissions into the
      generated AndroidManifest.xml.
========================================= */

const manifestPath = path.join(
    rootDir, "android", "app", "src", "main", "AndroidManifest.xml"
);

let manifest = fs.readFileSync(manifestPath, "utf8");

const cameraPermissions =
    '    <uses-permission android:name="android.permission.CAMERA" />\n' +
    '    <uses-feature android:name="android.hardware.camera" android:required="false" />\n' +
    '    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />\n';

if (manifest.includes("android.permission.CAMERA")) {

    console.log("[patch-android] Camera permissions already present, skipping.");

} else if (manifest.includes('<uses-permission android:name="android.permission.INTERNET" />')) {

    manifest = manifest.replace(
        '<uses-permission android:name="android.permission.INTERNET" />',
        '<uses-permission android:name="android.permission.INTERNET" />\n' + cameraPermissions
    );
    fs.writeFileSync(manifestPath, manifest);
    console.log("[patch-android] Camera permissions added to AndroidManifest.xml");

} else {

    // Fallback anchor if Capacitor's default INTERNET permission line
    // ever changes: insert right before </manifest>.
    manifest = manifest.replace("</manifest>", cameraPermissions + "</manifest>");
    fs.writeFileSync(manifestPath, manifest);
    console.log("[patch-android] Camera permissions added (fallback anchor) to AndroidManifest.xml");

}

console.log("[patch-android] Done.");
