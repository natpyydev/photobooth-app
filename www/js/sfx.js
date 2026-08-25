/* =========================================
   SFX.JS
   Tiny WebAudio "8-bit" sound effects.

   We only ship one real audio file
   (Assets/sounds/countdown.mp3), so
   click / success / error sounds are
   synthesized on the fly. This means
   the app never breaks from a missing
   file, and stays lightweight.
========================================= */

const SFX = (function () {

    let ctx = null;

    function getContext() {

        if (!ctx) {

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass) return null;

            ctx = new AudioContextClass();

        }

        // Browsers may start contexts
        // "suspended" until a user gesture.

        if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
        }

        return ctx;

    }


    function beep(frequency, duration, type, volume) {

        const audioCtx = getContext();

        if (!audioCtx) return;

        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        oscillator.type = type || "square";
        oscillator.frequency.value = frequency;

        gain.gain.value = volume || 0.06;

        oscillator.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);

    }


    function click() {
        beep(520, 0.08, "square", 0.05);
    }

    function success() {
        beep(660, 0.12, "square", 0.06);
        setTimeout(() => beep(880, 0.16, "square", 0.06), 100);
        setTimeout(() => beep(1100, 0.22, "square", 0.06), 210);
    }

    function error() {
        beep(180, 0.25, "sawtooth", 0.07);
    }

    function tick() {
        beep(880, 0.08, "square", 0.05);
    }

    function shutter() {
        beep(1400, 0.05, "square", 0.07);
    }


    // Optional real file for the countdown —
    // used alongside the synthesized "tick"
    // for a punchier feel, but never required.

    const countdownAudio =
        document.getElementById("countdownAudio");

    function playCountdownFile() {

        if (!countdownAudio) return;

        try {
            countdownAudio.pause();
            countdownAudio.currentTime = 0;
            countdownAudio.play().catch(() => {});
        } catch (e) {
            // Ignore — synthesized tick still plays.
        }

    }


    return {
        click,
        success,
        error,
        tick,
        shutter,
        playCountdownFile
    };

})();
