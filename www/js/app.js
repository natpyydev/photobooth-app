/* =========================================
   APP.JS
   Entry point.

   Nothing starts automatically. The app sits
   on the Press Start screen until tapped —
   that tap is what unlocks audio autoplay
   (BGM + voice) on mobile browsers, and is
   the moment Step 1 (with its voiceover)
   actually begins.
========================================= */

const startScreen = document.getElementById("startScreen");
const pressStartButton = document.getElementById("pressStartButton");

pressStartButton.addEventListener("click", () => {

    SFX.click();
    BGMSystem.start();

    startScreen.classList.add("hidden");
    tutorialScreen.classList.remove("hidden");

    showStep(1);

});


/* =========================================
   BGM MUTE TOGGLE (separate from voice mute —
   music keeps playing regardless of whether
   the tutorial voice lines are muted or not)
========================================= */

const bgmButton = document.getElementById("bgmButton");

bgmButton.addEventListener("click", () => {

    const enabled = BGMSystem.toggleMute();

    bgmButton.textContent = enabled ? "🎵" : "🔇";
    bgmButton.classList.toggle("muted", !enabled);

});
