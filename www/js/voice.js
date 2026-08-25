/* =========================================
   VOICE.JS
   Tagalog "Funny AI" Voiceover — MP3-based.

   Web Speech API was dropped (unreliable on
   mobile browsers / preview WebViews — often
   no Filipino voice installed, and some
   WebViews don't implement speechSynthesis
   at all). Instead this plays real .mp3
   files that YOU provide.

   HOW TO ADD YOUR VOICE LINES
   ----------------------------
   Record or generate these exact files and
   drop them into Assets/sounds/:

     Assets/sounds/step1.mp3
       "Mabuhay, mga manlalaro! Bago mo kalabitin
        ang syringe, siguraduhing tama ang posisyon
        ng mga gamit. Kung umilaw ang End Crystal,
        ibig sabihin ay sablay ang setup... Paki-tawag
        ang Staff agad!"

     Assets/sounds/step2.mp3
       "Piliin mo na ang paborito mong Minecraft frame
        para hindi mukhang ewan ang litrato mo. Dali na,
        pumili ka na!"

     Assets/sounds/step3.mp3
       "Hawakan na ang syringe at hilahin para bumagsak
        ang bola! At Tandaan: Tumingin sa camera at
        mag-pose kapag umilaw na ang End Crystal!"

     Assets/sounds/smile.mp3
       "3... 2... 1... SMILE!"

   (Assets/sounds/countdown.mp3 already exists and
   is used as the beep/tick sound during the countdown.)

   You can generate these for free using any
   Tagalog/Filipino text-to-speech site (e.g. TikTok's
   or CapCut's built-in voice feature has a funny/robot
   Filipino option, or any online TTS generator), or
   just record your own "funny AI" voice with a phone
   and export as .mp3.

   If a file is missing, the app silently skips audio
   and just shows the on-screen text — nothing breaks.
========================================= */

const VoiceSystem = (function () {

    let enabled = true;
    let currentAudio = null;

    const audioEl = new Audio();
    audioEl.preload = "auto";


    function stop() {

        try {
            audioEl.pause();
            audioEl.currentTime = 0;
        } catch (e) {
            // ignore
        }

    }


    /*
     * Play a voice line from Assets/sounds/<file>.
     * Resolves once playback ends, fails silently
     * (and resolves immediately) if the file is
     * missing or can't play, so the tutorial flow
     * never gets stuck waiting on audio.
     */

    function playFile(file, options) {

        options = options || {};

        return new Promise(resolve => {

            const finish = () => {
                if (options.onend) options.onend();
                resolve();
            };

            if (!enabled) {
                finish();
                return;
            }

            stop();

            audioEl.src = `Assets/sounds/${file}`;
            audioEl.muted = false;

            audioEl.onended = finish;
            audioEl.onerror = finish;

            audioEl.play().catch(finish);

        });

    }


    function playStep(step) {
        return playFile(`step${step}.mp3`);
    }

    function playSmile() {
        return playFile("smile.mp3");
    }


    function toggleMute() {

        enabled = !enabled;

        if (!enabled) stop();

        return enabled;

    }


    function isEnabled() {
        return enabled;
    }


    return {
        playStep,
        playSmile,
        stop,
        toggleMute,
        isEnabled
    };

})();
