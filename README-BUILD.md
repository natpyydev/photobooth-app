# Building the APK — No Laptop Needed

This repo is set up so **GitHub Actions builds the APK for you**
automatically, in the cloud, every time you push. You don't need
Android Studio, Node, or a laptop at all — you can even upload this
repo from your phone.

## One-time setup

1. Create a new GitHub repository (public or private, either works).
2. Upload **everything in this folder** to that repo, keeping the
   exact folder structure (`www/`, `android-patches/`, `scripts/`,
   `.github/`, `package.json`, `capacitor.config.json`, `.gitignore`).
   - Easiest from a phone: use the GitHub app or github.com's
     "Add file → Upload files" in the browser, drag the whole folder
     in, commit to `main`.
3. That's it — pushing to `main` automatically triggers the build.

## Getting your APK

1. On GitHub, go to your repo → the **Actions** tab.
2. You'll see a run called "Build Android APK" — click it (takes
   about 3–5 minutes to finish).
3. Scroll down to **Artifacts** → download
   `team-steve-photobooth-debug-apk`.
4. Unzip it — inside is `app-debug.apk`. Transfer that to your phone
   (Google Drive, Telegram-to-self, email, USB, etc.) and open it to
   install.
5. Android will warn about "unknown sources" the first time — this is
   normal for any APK not from the Play Store. Allow it for that one
   install.

If a run ever fails, click into it and open the red ✗ step to read
the error — most likely causes are a typo in `capacitor.config.json`
or `android-patches/MainActivity.java` not matching the `appId`
package path.

## Re-building after changes

Any time you edit files inside `www/` (your actual web app — HTML,
CSS, JS, Assets) and push to `main`, a new APK is built automatically.
No other steps needed.

## Testing the Volume Up shutter

This **must be tested on a real Android phone** — emulators don't
simulate hardware/Bluetooth volume buttons reliably. Pair your
Bluetooth remote to the phone like normal (Settings → Bluetooth),
open the installed app, get to the camera screen, and press the
remote. It should now take the photo directly instead of changing
media volume — because `MainActivity.java` intercepts
`KEYCODE_VOLUME_UP` before Android's default volume handler ever
sees it, and calls straight into `window.triggerCapture()` in
`js/camera.js`.

## If you later get access to a laptop

You can build locally instead of via GitHub Actions:

```bash
npm install
npx cap add android
npx cap sync android
node scripts/patch-android.js
npx cap open android
```

That last command opens the project in Android Studio, where you can
build/run directly on a connected phone via USB — useful for live
debugging (e.g. Chrome DevTools remote inspection of the WebView via
`chrome://inspect`), which isn't possible through GitHub Actions.

## Folder structure

```
package.json              — npm deps: @capacitor/core, @capacitor/android, @capacitor/cli
capacitor.config.json     — appId, appName, webDir (points to www/)
www/                       — your actual web app (unchanged from before)
android-patches/
  MainActivity.java        — the Volume Up intercept fix
scripts/
  patch-android.js         — copies MainActivity.java + adds camera
                              permissions into the freshly-generated
                              android/ project every build
.github/workflows/
  build-apk.yml             — GitHub Actions: builds the APK in the
                              cloud and uploads it as a downloadable
                              artifact
server.py, requirements.txt — optional local Python server for
                               full-quality QR download links (not
                               part of the APK itself — see www/README.md)
```

## Why `android/` isn't in this repo

`npx cap add android` regenerates it fresh from the installed
Capacitor version every CI run, and `scripts/patch-android.js`
re-applies your custom `MainActivity.java` + permissions right after.
This means the repo stays small and there's never a stale/out-of-sync
native project to debug — every build starts clean.
