/* =========================================
   FRAMES.JS
   Frame selection (Step 2 of the tutorial)
   + precise live-camera alignment so the
   video shows up exactly inside each
   frame's own transparent "window" — not
   just filling the whole camera-window box.

   These percentages were measured directly
   from the alpha channel of each frame PNG
   (position + size of its transparent
   cutout, as a % of its own 1536x2048
   canvas). Since frame-overlay fills the
   camera-window box almost exactly (their
   aspect ratios are within ~2%), the same
   percentages line the video up correctly.
========================================= */

let selectedFrame = "frame1.png";

const FRAME_WINDOWS = {
    "frame1.png": { left: 5.86,  top: 5.52,  width: 88.54, height: 75.83 },
    "frame2.png": { left: 16.34, top: 11.91, width: 65.89, height: 69.78 },
    "frame3.png": { left: 8.85,  top: 9.13,  width: 81.64, height: 82.42 },
    "frame4.png": { left: 8.85,  top: 9.13,  width: 81.64, height: 82.42 }
};

const frameOverlay =
    document.getElementById("frameOverlay");

const cameraWindow =
    document.getElementById("cameraWindow");

const frameOptions =
    document.querySelectorAll(".frame-option");


function applyFrameWindow(frameName) {

    const win = FRAME_WINDOWS[frameName];

    if (!win || !cameraWindow) return;

    cameraWindow.style.setProperty("--cam-left", `${win.left}%`);
    cameraWindow.style.setProperty("--cam-top", `${win.top}%`);
    cameraWindow.style.setProperty("--cam-width", `${win.width}%`);
    cameraWindow.style.setProperty("--cam-height", `${win.height}%`);

}

// Used by camera.js to composite the final photo the
// same way the live CSS preview is aligned.
function getFrameWindowFraction(frameName) {

    const win = FRAME_WINDOWS[frameName] || FRAME_WINDOWS["frame1.png"];

    return {
        left: win.left / 100,
        top: win.top / 100,
        width: win.width / 100,
        height: win.height / 100
    };

}

function getSelectedFrame() {
    return selectedFrame;
}


frameOptions.forEach(button => {

    button.addEventListener("click", () => {

        SFX.click();

        frameOptions.forEach(item => {
            item.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedFrame = button.dataset.frame;

        if (frameOverlay) {
            frameOverlay.src = `Assets/frames/${selectedFrame}`;
        }

        applyFrameWindow(selectedFrame);

    });

});

// Apply the default frame's window on load.
applyFrameWindow(selectedFrame);
