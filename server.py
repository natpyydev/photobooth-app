"""
=====================================================
 TEAM STEVE PHOTOBOOTH — OPTIONAL PYTHON SERVER
=====================================================

This server is OPTIONAL. The photobooth app works
fully without it (camera, tutorial voiceover, trigger,
capture, and a QR code all work client-side).

Run this ONLY if you want the QR code to link to a
real, full-quality downloadable photo instead of the
built-in compressed "preview" QR fallback.

WHAT IT DOES
------------
1. Serves the photobooth web app itself (index.html,
   css/, js/, Assets/) so guests' phones and the kiosk
   browser can both reach it from the same address.
2. Exposes POST /api/upload — the frontend sends the
   captured photo here, the server saves it, and
   returns a short URL like /photos/<id>.jpg.
3. Serves saved photos at /photos/<filename> so any
   phone on the same Wi-Fi/network can open the QR
   link and download the picture.

HOW TO RUN
----------
1. Install Flask:
       pip install -r requirements.txt

2. Start the server:
       python server.py

3. On the KIOSK computer/tablet, open the printed
   "Local URL" in the browser (this is the photobooth
   itself).

4. Make sure guest phones are on the SAME Wi-Fi network
   as the kiosk. When they scan the QR code after taking
   a photo, it will open the printed "Network URL" and
   download the picture — no extra setup needed.
"""

import base64
import re
import socket
import uuid
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
PHOTOS_DIR = BASE_DIR / "photos"
PHOTOS_DIR.mkdir(exist_ok=True)

app = Flask(__name__, static_folder=None)


# =====================================================
# SERVE THE FRONTEND (index.html, css/, js/, Assets/)
# =====================================================

@app.route("/")
def serve_index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/<path:filename>")
def serve_static_files(filename):
    # Don't let this route swallow the API/photo routes.
    if filename.startswith("api/") or filename.startswith("photos/"):
        return jsonify({"error": "not found"}), 404
    return send_from_directory(BASE_DIR, filename)


# =====================================================
# API
# =====================================================

@app.route("/api/ping")
def ping():
    return jsonify({"status": "ok"})


@app.route("/api/upload", methods=["POST"])
def upload_photo():

    data = request.get_json(silent=True) or {}
    image_data_url = data.get("image", "")

    match = re.match(r"^data:image/(\w+);base64,(.+)$", image_data_url)

    if not match:
        return jsonify({"error": "Invalid image data."}), 400

    extension = match.group(1)
    if extension == "jpeg":
        extension = "jpg"

    raw_bytes = base64.b64decode(match.group(2))

    filename = f"{uuid.uuid4().hex}.{extension}"
    filepath = PHOTOS_DIR / filename

    with open(filepath, "wb") as f:
        f.write(raw_bytes)

    return jsonify({"url": f"/photos/{filename}"})


@app.route("/photos/<path:filename>")
def serve_photo(filename):
    return send_from_directory(PHOTOS_DIR, filename)


# =====================================================
# STARTUP HELPERS
# =====================================================

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


if __name__ == "__main__":

    PORT = 5000
    local_ip = get_local_ip()

    print("=" * 55)
    print(" TEAM STEVE PHOTOBOOTH SERVER")
    print("=" * 55)
    print(f" Kiosk (this computer):  http://localhost:{PORT}")
    print(f" Network (for guests):   http://{local_ip}:{PORT}")
    print("=" * 55)
    print(" Open the Kiosk URL in the browser running the")
    print(" photobooth. Guests on the same Wi-Fi can scan")
    print(" the QR code after each photo to download it.")
    print("=" * 55)

    app.run(host="0.0.0.0", port=PORT, debug=False)
