/* =========================================
   BGM.JS
   Continuous background music.

   Starts once (on the Press Start tap, which
   also satisfies the browser's "user gesture"
   requirement for audio autoplay) and then
   loops forever for as long as the page is
   open. It is completely independent from
   the voice/SFX audio — playing a step
   voiceover or the countdown never pauses
   or restarts it.

   REQUIRED FILE
   -------------
   Put your loopable music track at:
     Assets/sounds/bgm.mp3

   If the file is missing, this silently does
   nothing (no error, no broken UI) — the app
   just plays without music until you add one.
========================================= */

const BGMSystem = (function () {

    const bgmEl = document.getElementById("bgmAudio");
    let started = false;
    let muted = false;

    if (bgmEl) {
        bgmEl.volume = 0.35; // sits under the voice lines, never overpowers them
        bgmEl.loop = true;
    }


    /*
     * Must be called from inside a direct user-gesture
     * handler (e.g. the Press Start button's click) —
     * that's what satisfies mobile browsers' autoplay
     * policy for BOTH this and the voice/SFX audio that
     * plays later in the same session.
     */
    function start() {

        if (!bgmEl || started) return;

        started = true;

        bgmEl.muted = muted;
        bgmEl.play().catch(() => {
            // If it still gets blocked, the tutorial and
            // camera flow continue working normally without
            // music — nothing else depends on this succeeding.
        });

    }


    function toggleMute() {

        muted = !muted;

        if (bgmEl) bgmEl.muted = muted;

        return !muted; // returns "enabled" state, matching VoiceSystem's convention

    }


    function isMuted() {
        return muted;
    }


    return {
        start,
        toggleMute,
        isMuted
    };

})();
