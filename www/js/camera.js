/* =========================================
   CAMERA.JS
   Camera access, Arduino Bluetooth
   "Volume Up" trigger listener,
   countdown voiceover, and photo capture.
========================================= */

const video = document.getElementById("camera");
const countdownEl = document.getElementById("countdown");
const flashEl = document.getElementById("flash");
const testTriggerButton = document.getElementById("testTriggerButton");
const signalStatus = document.getElementById("signalStatus");
const signalStatusText = document.getElementById("signalStatusText");

let stream = null;
let takingPhoto = false;
let finalPhotoBlob = null;
let finalPhotoURL = null;
let triggerArmed = false;


/* =========================================
   CAMERA START
========================================= */

async function startCamera() {

    try {

        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: { ideal: 1080 },
                height: { ideal: 1440 }
            },
            audio: false
        });

        video.srcObject = stream;
        await video.play();

    } catch (error) {

        console.error(error);

        signalStatusText.textContent =
            "⚠️ Kailangan ng pahintulot sa camera. Paki-check ang browser settings.";

    }

}


function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/* =========================================
   ARM / DISARM THE TRIGGER
   Called when the camera screen opens
   and the app is ready to listen for
   the Bluetooth remote's "Volume Up"
   signal (sent by the Arduino relay).
========================================= */

function armTrigger() {

    triggerArmed = true;

    signalStatus.classList.add("armed");
    signalStatus.classList.remove("triggered");

    signalStatusText.textContent =
        "🎮 NAGHIHINTAY NG SIGNAL MULA SA REMOTE...";

}

function disarmTrigger() {
    triggerArmed = false;
}


/* =========================================
   COUNTDOWN
========================================= */

async function showCountdownNumber(label) {

    countdownEl.textContent = label;
    countdownEl.classList.remove("show");
    void countdownEl.offsetWidth;
    countdownEl.classList.add("show");

    await wait(800);

    countdownEl.classList.remove("show");

}

async function runCountdown() {

    // Spoken cue matches the requested script:
    // "3... 2... 1... SMILE!" (Assets/sounds/smile.mp3)
    VoiceSystem.playSmile();
    SFX.playCountdownFile();

    SFX.tick();
    await showCountdownNumber("3");

    SFX.tick();
    await showCountdownNumber("2");

    SFX.tick();
    await showCountdownNumber("1");

    SFX.shutter();
    countdownEl.textContent = "SMILE! 😄";
    countdownEl.classList.add("show");

    await wait(500);

    countdownEl.classList.remove("show");

}


/* =========================================
   FLASH
========================================= */

async function cameraFlash() {
    flashEl.classList.remove("active");
    void flashEl.offsetWidth;
    flashEl.classList.add("active");
    await wait(350);
}


/* =========================================
   CAPTURE (video + frame burned in)
========================================= */

function capturePhoto() {

    return new Promise((resolve, reject) => {

        if (!video.videoWidth || !video.videoHeight) {
            reject(new Error("Camera is not ready."));
            return;
        }

        // Output canvas matches the frame PNG's own
        // aspect ratio (1536x2048 = 3:4) so nothing
        // gets stretched or misaligned.
        const outputWidth = 900;
        const outputHeight = 1200;

        const canvas = document.createElement("canvas");
        canvas.width = outputWidth;
        canvas.height = outputHeight;

        const ctx = canvas.getContext("2d");

        // Where the live video should land, matching
        // this frame's transparent window exactly
        // (same rect used for the on-screen CSS preview).
        const win = getFrameWindowFraction(selectedFrame);

        const destX = win.left * outputWidth;
        const destY = win.top * outputHeight;
        const destWidth = win.width * outputWidth;
        const destHeight = win.height * outputHeight;

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        const videoRatio = videoWidth / videoHeight;
        const targetRatio = destWidth / destHeight;

        let sourceWidth = videoWidth;
        let sourceHeight = videoHeight;
        let sourceX = 0;
        let sourceY = 0;

        if (videoRatio > targetRatio) {
            sourceWidth = videoHeight * targetRatio;
            sourceX = (videoWidth - sourceWidth) / 2;
        } else {
            sourceHeight = videoWidth / targetRatio;
            sourceY = (videoHeight - sourceHeight) / 2;
        }

        // Mirror the video (like a real mirror) when drawing,
        // cropped/scaled to sit exactly inside the frame's window.
        ctx.save();
        ctx.translate(destX + destWidth, destY);
        ctx.scale(-1, 1);

        ctx.drawImage(
            video,
            sourceX, sourceY,
            sourceWidth, sourceHeight,
            0, 0,
            destWidth, destHeight
        );

        ctx.restore();

        // Burn in the selected Minecraft frame on top —
        // its transparent window reveals the video below,
        // its opaque artwork covers everything else.
        if (frameOverlay.complete) {
            ctx.drawImage(frameOverlay, 0, 0, outputWidth, outputHeight);
        }

        canvas.toBlob(
            blob => {
                if (!blob) {
                    reject(new Error("Failed to create image."));
                    return;
                }
                resolve(blob);
            },
            "image/jpeg",
            0.92
        );

    });

}


/* =========================================
   DISPLAY RESULT
========================================= */

function displayPhoto(blob) {

    if (finalPhotoURL) {
        URL.revokeObjectURL(finalPhotoURL);
    }

    finalPhotoBlob = blob;
    finalPhotoURL = URL.createObjectURL(blob);

    document.getElementById("resultImage").src = finalPhotoURL;

}


/* =========================================
   TAKE PHOTO (full sequence)
========================================= */

async function takePhoto() {

    if (takingPhoto) return;

    if (!video.videoWidth) {
        signalStatusText.textContent = "⚠️ Hindi pa ready ang camera...";
        return;
    }

    takingPhoto = true;
    disarmTrigger();

    testTriggerButton.disabled = true;

    signalStatus.classList.remove("armed");
    signalStatus.classList.add("triggered");
    signalStatusText.textContent = "📸 KINUKUNAN NA ANG LITRATO...";

    try {

        await runCountdown();

        const photo = await capturePhoto();

        await cameraFlash();

        displayPhoto(photo);

        showResultScreen();

        await generateQR(photo);

        SFX.success();

    } catch (error) {

        console.error(error);
        signalStatusText.textContent = "⚠️ May error, subukan ulit.";
        SFX.error();

    }

    takingPhoto = false;
    testTriggerButton.disabled = false;

}


function showResultScreen() {

    document.getElementById("photoboothScreen").classList.add("hidden");
    document.getElementById("resultSection").classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });

}


/* =========================================
   TRIGGER LISTENERS

   IMPORTANT REALITY CHECK about "Volume Up":
   On most phones, the physical volume buttons
   are intercepted by the OS *before* they ever
   reach a website — this is a deliberate OS/
   browser security behavior, not a bug in this
   app, and no amount of JavaScript can override
   it for a plain browser tab.

   Cheap Bluetooth "selfie shutter" remotes work
   around this because they pair as an external
   HID keyboard: some phones DO forward their
   keypress to the page (commonly as "AudioVolumeUp",
   but some remotes instead send Enter, PageUp/
   PageDown, or a media key). Because the exact
   code varies by remote/phone, this listens for
   every commonly-seen variant AND shows a live
   "Last key detected" readout below — press your
   remote once while this screen is open and you'll
   see EXACTLY what code it sends, so the list can
   be adjusted if needed.

   Spacebar / Enter and the on-screen button always
   work regardless, as a guaranteed fallback.
========================================= */

const VOLUME_UP_KEYS = [
    "AudioVolumeUp", "VolumeUp", "MediaPlayPause",
    "PageUp", "PageDown", "ArrowUp", "F7"
];
const VOLUME_UP_KEYCODES = [175, 182, 33, 34, 38, 118];

const keyDebug = document.getElementById("keyDebug");
const keyDebugText = document.getElementById("keyDebugText");

document.addEventListener("keydown", event => {

    // Always show what was detected — helps identify
    // your specific remote's signal even before it's
    // added to the trigger list above.
    if (keyDebug && keyDebugText) {
        keyDebug.classList.remove("hidden");
        keyDebugText.textContent =
            `key="${event.key}" code="${event.code}" keyCode=${event.keyCode}`;
    }

    const isVolumeUp =
        VOLUME_UP_KEYS.includes(event.key) ||
        VOLUME_UP_KEYS.includes(event.code) ||
        VOLUME_UP_KEYCODES.includes(event.keyCode);

    const isManualTestKey =
        event.code === "Space" || event.code === "Enter" || event.key === "Enter";

    if (!triggerArmed) return;

    if (isVolumeUp || isManualTestKey) {
        event.preventDefault();
        takePhoto();
    }

});

// Hook for any hardware bridge (e.g. Web Serial / Web
// Bluetooth script) that wants to fire the shutter directly.
window.triggerCapture = function () {
    if (triggerArmed) takePhoto();
};


/* =========================================
   MANUAL BUTTONS
========================================= */

testTriggerButton.addEventListener("click", () => {
    SFX.click();
    takePhoto();
});


/* =========================================
   DOWNLOAD
========================================= */

document.getElementById("downloadButton").addEventListener("click", () => {

    SFX.click();

    if (!finalPhotoURL) return;

    const link = document.createElement("a");
    link.href = finalPhotoURL;
    link.download = "TeamSteve-Photobooth.jpg";
    link.click();

});
