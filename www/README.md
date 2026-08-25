# Team Steve — Rube Goldberg Photobooth

Web-based photobooth app (HTML + CSS + JS, optional Python) para sa
**Team Steve Minecraft** Rube Goldberg project. Lo-fi Minecraft
16x16 pixel-art theme sa buong UI.

## Buong Flow

0. **Press Start Screen** — walang tumutunog o gumagalaw hanggang
   hindi pa pinipindot ang blinking na "▶ PRESS START" button. Ito
   rin ang tumatayong "user gesture" na kailangan para pumayag ang
   browser sa audio autoplay (parehong BGM at voiceover).
1. **Tutorial (3 Hakbang)** — segmented pixel progress bar,
   "SUSUNOD →" button, at Tagalog voiceover (MP3-based) sa bawat
   hakbang:
   - Hakbang 1: Mechanics & Crystal/Staff check
   - Hakbang 2: Piliin ang Frame
   - Hakbang 3: Hilahin ang Syringe + paalala tungkol sa End Crystal
2. **Camera & Trigger** — hihintayin ang signal mula sa Arduino
   Bluetooth remote (o manual test button/Enter/Space). Kapag
   na-trigger: "3... 2... 1... SMILE!" voice + on-screen countdown,
   tapos kukuha ng litrato (may Minecraft frame na naka-overlay,
   diretso sa loob ng camera window ng portal-grass frame).
3. **Instant Preview + Dynamic QR** — makikita agad ang huling
   litrato at may QR code para ma-download ito sa ibang phone.

Mula sa Press Start hanggang sa katapusan, tumutugtog nang
tuloy-tuloy ang **background music** sa likod — hindi ito
napapatigil o na-i-interrupt kahit tumutugtog pa ang mga voice
lines sa bawat hakbang (magkasabay silang tumutugtog).

## Paano Patakbuhin (Simpleng Paraan — Walang Setup)

Buksan lang ang `index.html` sa browser (o i-preview sa SPCK Editor).
Lahat gumagana: Press Start, tutorial, camera, trigger, at QR code —
walang kailangang internet o Python (QR library ay naka-bundle na
locally sa `js/qrcode.min.js`, hindi na CDN-dependent).

> Kailangan ng camera permission ang browser. Sa mobile Chrome/Safari,
> dapat naka-HTTPS o naka-localhost ang page para pumayag ang camera.

## ⚠️ Kailangan mong idagdag: mga MP3 file

Sa `Assets/sounds/`, kailangan ng mga sumusunod na file:

| File | Para saan |
|---|---|
| `bgm.mp3` | Looping background music, tumutugtog buong session |
| `step1.mp3` | "Mabuhay, mga manlalaro! Bago mo kalabitin ang syringe, siguraduhing tama ang posisyon ng mga gamit. Kung umilaw ang End Crystal, ibig sabihin ay sablay ang setup... Paki-tawag ang Staff agad!" |
| `step2.mp3` | "Piliin mo na ang paborito mong Minecraft frame para hindi mukhang ewan ang litrato mo. Dali na, pumili ka na!" |
| `step3.mp3` | "Hawakan na ang syringe at hilahin para bumagsak ang bola! At Tandaan: Tumingin sa camera at mag-pose kapag umilaw na ang End Crystal!" |
| `smile.mp3` | "3... 2... 1... SMILE!" |

`countdown.mp3` ay **meron na** (beep/tick sound).

Kung wala pang file, tahimik lang sini-skip ng app ang audio (walang
error) at ang on-screen text na lang ang makikita — kaya safe i-test
ang app kahit wala pa lahat ng MP3.

- Para sa `step1-3.mp3` / `smile.mp3`: gumamit ng kahit anong libreng
  Tagalog TTS site (CapCut/TikTok voice feature may Filipino option),
  o mag-record ng sarili mong "funny AI" na boses gamit ang telepono.
- Para sa `bgm.mp3`: gumamit ng royalty-free 8-bit/chiptune loop
  (libre sa Pixabay Music, Incompetech, YouTube Audio Library).
  Piliin yung tahimik/di-nakaka-tabang sa background — naka-set na
  ang app sa mas mababang volume dito para hindi ma-overpower ang
  mga voice lines.

Kahit anong format ang i-export mo, palaging i-save bilang `.mp3` at
gamitin eksakto ang mga filename sa itaas.

## Tungkol sa "Volume Up" Trigger (mahalagang paalala)

Sa maraming phone, ang physical volume buttons ay in-iintercept ng
OS **bago pa** ito marating ng kahit anong website — hindi ito bug
ng app na ito, kundi security behavior ng browser/OS mismo.

Gumagana ang mga murang "Bluetooth selfie remote" dahil nag-papair
sila bilang external na keyboard — pero iba-iba ang code na
ipinapadala nila depende sa brand/phone (minsan "AudioVolumeUp",
minsan "Enter", "PageUp", atbp).

**May built-in diagnostic tool ang app**: sa camera screen, may
lalabas na maliit na "Last key detected" panel sa itaas kaliwa sa
unang pagkaka-press ng kahit anong key/remote — makikita mo agad
kung anong exact signal ang dumarating. Kung hindi tumugma sa
listahan sa `js/camera.js` (`VOLUME_UP_KEYS` / `VOLUME_UP_KEYCODES`),
sabihin mo lang sa akin kung ano ang lumabas doon at ia-adjust ko.

**Palaging gumagana bilang fallback**, kahit walang Bluetooth signal:
- **Enter** o **Spacebar** sa keyboard
- Ang **"Take Photo"** button mismo sa screen (naka-bake na sa
  disenyo/artwork, hindi na hiwalay na floating button)

## Paano Patakbuhin (Full Setup — Totoong Event, Full-Quality QR)

Kung gusto mong mag-generate ng **full-quality**, tunay na
downloadable na link sa QR code (sa halip na compressed thumbnail
lang), patakbuhin ang kasamang Python server:

```bash
pip install -r requirements.txt
python server.py
```

Ipi-print nito ang dalawang address:

- **Kiosk URL** (`http://localhost:5000`) — buksan ito sa browser ng
  photobooth station.
- **Network URL** (`http://<IP>:5000`) — ito ang gagamitin ng mga
  bisita. Siguraduhing naka-connect sila sa parehong Wi-Fi.

Kapag naka-detect ng server, awtomatikong lilipat ang app sa
"full-quality" QR mode.

## Tungkol sa Camera Window Alignment

Lahat ng decorative na PNG (`Blue-sky`, `Cloud`, `portal-grass`,
`steve-ball-run`, `Minecraft`, `photobooth`, `take-photo`,
`press-space`) ay iisa lang ang canvas size (2160×3840, 9:16 ratio) —
parang magkakahiwalay na "layers" na dapat pagsamahin. Ang buong
camera screen ay isang solong 9:16 "stage" (tingnan ang `.stage` sa
`css/photobooth.css`) kung saan naka-stack ang lahat ng layers, at
ang live camera + napiling frame ay eksaktong naka-align sa
transparent window ng `portal-grass.png` (na-sukat via alpha-channel
analysis: left 17.92%, top 30.65%, width 64.07%, height 46.85%).

Ang mga `frame1-4.png` naman (napipili sa Hakbang 2) ay iba't ibang
maliit na overlay border na eksaktong naka-align din sa loob ng
parehong camera window — bawat isa may sariling transparent cutout
na na-sukat rin (tingnan ang `FRAME_WINDOWS` sa `js/frames.js`).

**Tip:** Ilan sa mga frame (hal. `frame1.png`) ay may sariling
"STEVE BALL RUN" title na naka-bake, na maaaring mag-duplicate sa
title na nasa itaas ng `portal-grass.png` composition. Kung gusto mo
ng mas clean na look, subukan ang `frame3.png` o `frame4.png` sa
Hakbang 2.

## Pixel-Art Theme

Ang buong UI ay ginawang "Lo-Fi Minecraft" style:

- **Fonts**: `Press Start 2P` (mga heading/button) at `Silkscreen`
  (body text) — parehong libreng pixel fonts mula Google Fonts.
- **Mga kulay**: grass green, dirt brown, stone gray, redstone red —
  naka-define bilang CSS variables sa `css/main.css` (`--mc-*`).
- **Chunky pixel buttons**: gamit ang classic Minecraft GUI bevel
  trick (light top/left edge, dark bottom/right edge via box-shadow),
  parisukat ang mga sulok (walang border-radius).
- **`image-rendering: pixelated`**: naka-apply sa lahat ng img/video
  para mapanatili ang blocky/retro na itsura kahit i-scale.
- Reusable `.pixel-border` class sa `css/main.css` para sa anumang
  bagong element na gusto mong bigyan ng parehong pixel-bevel look.

## File Structure

```
index.html
css/
  main.css          — Minecraft palette, fonts, base styles
  start.css          — Press Start screen
  tutorial.css       — tutorial/guide screen (pixel UI)
  photobooth.css     — camera + trigger screen (the "stage" layout)
  result.css         — preview + QR screen (pixel UI)
js/
  bgm.js              — continuous background music player
  voice.js            — Tagalog MP3 voiceover player
  sfx.js              — synthesized click/success/error sounds
  frames.js           — frame picker + per-frame window alignment
  tutorial.js         — 3-step flow + crystal check logic
  camera.js           — camera, trigger listener, capture, key debug
  qr.js               — QR generation (server or offline mode)
  qrcode.min.js       — bundled QR library (no CDN/internet needed)
  app.js              — entry point + Press Start wiring
Assets/               — images, frames, countdown sound
  sounds/             — put bgm.mp3, step1-3.mp3, smile.mp3 here
server.py             — OPTIONAL Python backend for real QR links
requirements.txt
```

## Mga Dev/Staff Hooks (para sa hardware integration)

Kung gusto mong ikonekta ang totoong sensor ng End Crystal (hal. sa
pamamagitan ng Web Serial API), tawagin na lang ang:

```js
window.setCrystalReady();   // LIGHT OFF — ready
window.setCrystalError();   // LIGHT ON — may sablay
window.triggerCapture();    // pwedeng gamitin bilang alternative shutter trigger
```
