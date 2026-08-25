/* =========================================
   QR.JS
   Dynamic QR code for the final photo.

   Two modes:

   1. SERVER MODE (recommended for real events)
      If the optional Python server (server.py)
      is running, we upload the full-quality
      photo to it and encode the short returned
      URL in the QR. Scanning it opens a real
      download page — works great even for
      large, high quality images.

   2. OFFLINE / PREVIEW MODE (default, no setup)
      Used automatically when no server is
      detected — e.g. when just previewing the
      app inside SPCK Editor. A small compressed
      thumbnail is embedded directly inside the
      QR code as a data URL, so scanning still
      works with zero backend required.
========================================= */

const qrcodeEl = document.getElementById("qrcode");
const qrStatus = document.getElementById("qrStatus");

// Change this if your Python server runs on a
// different host/port than the page itself.
const SERVER_BASE_URL = "";


async function pingServer() {

    try {

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 900);

        const response = await fetch(
            `${SERVER_BASE_URL}/api/ping`,
            { signal: controller.signal }
        );

        clearTimeout(timeout);

        return response.ok;

    } catch (error) {

        return false;

    }

}


function blobToBase64(blob) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);

    });

}


async function uploadToServer(blob) {

    const base64 = await blobToBase64(blob);

    const response = await fetch(`${SERVER_BASE_URL}/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 })
    });

    if (!response.ok) {
        throw new Error("Upload failed.");
    }

    const data = await response.json();

    // Server returns a relative path like /photos/xxxx.jpg
    const absoluteUrl =
        data.url.startsWith("http")
            ? data.url
            : `${window.location.origin}${data.url}`;

    return absoluteUrl;

}


/*
 * QR codes can only hold a limited amount of data
 * (roughly ~2900 bytes at the lowest error-correction
 * level). A full-size photo is way too big, so for the
 * offline fallback we shrink + re-compress a thumbnail,
 * trying progressively smaller sizes until the resulting
 * base64 string actually fits inside a scannable QR code.
 */

const QR_SAFE_BYTE_BUDGET = 2200; // raw bytes, before base64 expansion

const THUMBNAIL_ATTEMPTS = [
    { width: 110, height: 147, quality: 0.45 },
    { width: 90,  height: 120, quality: 0.35 },
    { width: 70,  height: 93,  quality: 0.28 },
    { width: 50,  height: 67,  quality: 0.22 },
    { width: 36,  height: 48,  quality: 0.2 }
];

function drawThumbnail(image, width, height, quality) {

    return new Promise((resolve, reject) => {

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        canvas.getContext("2d").drawImage(image, 0, 0, width, height);

        canvas.toBlob(
            blob => blob ? resolve(blob) : reject(new Error("toBlob failed")),
            "image/jpeg",
            quality
        );

    });

}

async function compressForQR(blob) {

    const image = new Image();
    const objectUrl = URL.createObjectURL(blob);

    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = objectUrl;
    });

    let lastBlob = null;

    for (const attempt of THUMBNAIL_ATTEMPTS) {

        const thumbBlob = await drawThumbnail(
            image, attempt.width, attempt.height, attempt.quality
        );

        lastBlob = thumbBlob;

        if (thumbBlob.size <= QR_SAFE_BYTE_BUDGET) {
            URL.revokeObjectURL(objectUrl);
            return thumbBlob;
        }

    }

    URL.revokeObjectURL(objectUrl);

    // Even the smallest attempt didn't fit — return it
    // anyway; the caller will detect it's still too big
    // and show a graceful message instead of crashing.
    return lastBlob;

}


function renderQR(text) {

    qrcodeEl.innerHTML = "";

    new QRCode(qrcodeEl, {
        text: text,
        width: 220,
        height: 220,
        correctLevel: QRCode.CorrectLevel.L
    });

}

// renderQR can throw if the QR library rejects the input
// (e.g. still too long) — callers should wrap it in try/catch.


async function generateQR(photoBlob) {

    qrcodeEl.innerHTML = "";
    qrStatus.textContent = "Ginagawa ang QR...";

    const serverAvailable = await pingServer();

    if (serverAvailable) {

        try {

            const url = await uploadToServer(photoBlob);

            renderQR(url);

            qrStatus.textContent =
                "✅ Handa na! I-scan para i-download ang FULL QUALITY na litrato.";

            return;

        } catch (error) {

            console.error(error);
            // fall through to offline mode below

        }

    }

    // OFFLINE / PREVIEW MODE
    try {

        const compressed = await compressForQR(photoBlob);
        const base64 = await blobToBase64(compressed);

        if (compressed.size > QR_SAFE_BYTE_BUDGET) {
            throw new Error("Photo too large to fit in a QR code offline.");
        }

        renderQR(base64);

        qrStatus.textContent =
            "📶 Preview mode ang QR (walang Python server). " +
            "Para sa full-quality na download link, patakbuhin ang " +
            "kasamang server.py.";

    } catch (error) {

        console.error(error);

        qrcodeEl.innerHTML = "";
        qrStatus.textContent =
            "⚠️ Hindi ma-generate ang QR nang offline (masyadong laki " +
            "ang litrato para sa QR code). Gamitin ang Download button " +
            "sa ibaba, o patakbuhin ang server.py para sa QR na may " +
            "full-quality na download link.";

    }

}
