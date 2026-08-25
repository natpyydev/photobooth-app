/* =========================================
   TUTORIAL.JS
   Step-by-step guide screen (3 steps)
   with Tagalog "funny AI" voiceover.
========================================= */

const tutorialScreen = document.getElementById("tutorialScreen");
const photoboothScreen = document.getElementById("photoboothScreen");
const progressBlocks = [
    document.getElementById("progressStep1"),
    document.getElementById("progressStep2"),
    document.getElementById("progressStep3")
];

const crystalIndicator = document.getElementById("crystalIndicator");
const crystalText = document.getElementById("crystalText");
const staffAlarm = document.getElementById("staffAlarm");
const proceedButton = document.getElementById("proceedButton");

const muteButton = document.getElementById("muteButton");

let currentStep = 1;
let crystalReady = true; // simulated "END CRYSTAL" sensor state


/* =========================================
   (Voice lines are now spoken via MP3 files —
   see js/voice.js for the exact script text
   and required filenames.)
========================================= */


/* =========================================
   SHOW STEP
========================================= */

function showStep(step) {

    currentStep = step;

    document.querySelectorAll(".tutorial-step").forEach(item => {
        item.classList.remove("active");
    });

    document.getElementById(`step${step}`).classList.add("active");

    progressBlocks.forEach((block, index) => {
        block.classList.toggle("filled", index < step);
    });

    VoiceSystem.playStep(step);

}


/* =========================================
   STEP 1: CRYSTAL CHECK
========================================= */

function updateCrystalUI() {

    if (crystalReady) {

        crystalIndicator.classList.remove("on");
        crystalIndicator.classList.add("off");
        crystalText.textContent = "LIGHT OFF — READY NA!";
        staffAlarm.classList.add("hidden");
        proceedButton.disabled = false;

    } else {

        crystalIndicator.classList.remove("off");
        crystalIndicator.classList.add("on");
        crystalText.textContent = "LIGHT ON — MAY SABLAY!";
        staffAlarm.classList.remove("hidden");
        proceedButton.disabled = true;

    }

}

updateCrystalUI();

// Exposed hooks in case real hardware (Web Serial /
// Web Bluetooth bridge script) wants to drive this
// state instead of the staff demo toggle below.
window.setCrystalReady = function () {
    crystalReady = true;
    updateCrystalUI();
};

window.setCrystalError = function () {
    crystalReady = false;
    updateCrystalUI();
};

document.getElementById("devToggleCrystal").addEventListener("click", () => {
    SFX.click();
    crystalReady = !crystalReady;
    updateCrystalUI();
});

document.getElementById("callStaffButton").addEventListener("click", () => {
    SFX.click();
    alert("📢 Tumatawag ng Staff... Sandali lang po!");
});

proceedButton.addEventListener("click", () => {
    if (proceedButton.disabled) return;
    SFX.click();
    showStep(2);
});


/* =========================================
   STEP 2: FRAME SELECTION
========================================= */

document.getElementById("backToStep1").addEventListener("click", () => {
    SFX.click();
    showStep(1);
});

document.getElementById("nextFrameButton").addEventListener("click", () => {
    SFX.click();
    showStep(3);
});


/* =========================================
   STEP 3: ARM THE MACHINE / GO TO CAMERA
========================================= */

document.getElementById("backToStep2").addEventListener("click", () => {
    SFX.click();
    showStep(2);
});

document.getElementById("armButton").addEventListener("click", async () => {

    SFX.click();
    VoiceSystem.stop();

    tutorialScreen.classList.add("hidden");
    photoboothScreen.classList.remove("hidden");

    await startCamera();
    armTrigger();

});


/* =========================================
   MUTE TOGGLE
========================================= */

muteButton.addEventListener("click", () => {

    const enabled = VoiceSystem.toggleMute();

    muteButton.textContent = enabled ? "🔊" : "🔇";
    muteButton.classList.toggle("muted", !enabled);

});


/* =========================================
   RESET FOR NEXT GUEST
========================================= */

document.getElementById("newPhotoButton").addEventListener("click", () => {

    SFX.click();

    document.getElementById("resultSection").classList.add("hidden");

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    crystalReady = true;
    updateCrystalUI();

    showStep(1);

    tutorialScreen.classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });

});
