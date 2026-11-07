// src/lib/siren.js
// Pengelola audio sirine ambulans tangguh untuk situasi darurat lansia & pengawas.
// Mendukung pemutaran file MP3 (/alert/ambulance-2.mp3), fallback Web Audio API oscillator,
// dan penanganan otomatis kebijakan autoplay peramban modern.

let audioInstance = null;
let webAudioCtx = null;
let webAudioNodes = null;
let isActive = false;
let isBlocked = false;
const listeners = new Set();
let unlockListenerAdded = false;
let globalUnlockInitialized = false;

function notify() {
  listeners.forEach((fn) => {
    try {
      fn({ active: isActive, blocked: isBlocked });
    } catch {}
  });
}

export function subscribeSiren(callback) {
  listeners.add(callback);
  callback({ active: isActive, blocked: isBlocked });
  return () => listeners.delete(callback);
}

function startWebAudioSiren() {
  if (typeof window === 'undefined') return false;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;

    if (!webAudioCtx || webAudioCtx.state === 'closed') {
      webAudioCtx = new Ctx();
    }
    if (webAudioCtx.state === 'suspended') {
      webAudioCtx.resume().catch(() => {});
    }

    stopWebAudioSiren();

    const osc = webAudioCtx.createOscillator();
    const lfo = webAudioCtx.createOscillator();
    const lfoGain = webAudioCtx.createGain();
    const mainGain = webAudioCtx.createGain();

    // Nada sirine ambulans standar Indonesia/Eropa (two-tone wailing sweep)
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(820, webAudioCtx.currentTime);

    // Modulasi frekuensi 680 Hz - 980 Hz pada kecepatan 1.8 Hz
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(1.8, webAudioCtx.currentTime);
    lfoGain.gain.setValueAtTime(160, webAudioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    mainGain.gain.setValueAtTime(0.35, webAudioCtx.currentTime);

    osc.connect(mainGain);
    mainGain.connect(webAudioCtx.destination);

    osc.start();
    lfo.start();

    webAudioNodes = { osc, lfo, mainGain };
    return true;
  } catch (err) {
    console.warn('Web Audio siren fallback error:', err);
    return false;
  }
}

function stopWebAudioSiren() {
  if (webAudioNodes) {
    try {
      webAudioNodes.osc.stop();
      webAudioNodes.lfo.stop();
      webAudioNodes.osc.disconnect();
      webAudioNodes.lfo.disconnect();
      webAudioNodes.mainGain.disconnect();
    } catch {}
    webAudioNodes = null;
  }
}

function setupUnlockListener() {
  if (unlockListenerAdded || typeof window === 'undefined') return;
  unlockListenerAdded = true;

  const onUserGesture = () => {
    unlockListenerAdded = false;
    window.removeEventListener('pointerdown', onUserGesture, true);
    window.removeEventListener('click', onUserGesture, true);
    window.removeEventListener('keydown', onUserGesture, true);
    window.removeEventListener('touchstart', onUserGesture, true);

    // Jika sirine sedang dalam status aktif tetapi tertahan autoplay, langsung bunyikan!
    if (isActive) {
      if (audioInstance) {
        audioInstance.currentTime = 0;
        audioInstance
          .play()
          .then(() => {
            isBlocked = false;
            stopWebAudioSiren();
            notify();
          })
          .catch(() => {
            const ok = startWebAudioSiren();
            isBlocked = !ok;
            notify();
          });
      } else {
        const ok = startWebAudioSiren();
        isBlocked = !ok;
        notify();
      }
    }
  };

  window.addEventListener('pointerdown', onUserGesture, true);
  window.addEventListener('click', onUserGesture, true);
  window.addEventListener('keydown', onUserGesture, true);
  window.addEventListener('touchstart', onUserGesture, true);
}

export function initAudioUnlocker() {
  if (globalUnlockInitialized || typeof window === 'undefined') return;
  globalUnlockInitialized = true;

  const unlock = () => {
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('click', unlock, true);
    window.removeEventListener('keydown', unlock, true);

    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        const dummy = new Ctx();
        dummy.resume().then(() => dummy.close()).catch(() => {});
      }
    } catch {}

    try {
      if (!audioInstance) {
        audioInstance = new Audio('/alert/ambulance-2.mp3');
        audioInstance.loop = true;
      }
      audioInstance.load();
    } catch {}
  };

  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('click', unlock, true);
  window.addEventListener('keydown', unlock, true);
}

export function playSiren() {
  if (typeof window === 'undefined') return;
  isActive = true;

  // Inisialisasi file MP3 sirine ambulans
  if (!audioInstance) {
    audioInstance = new Audio('/alert/ambulance-2.mp3');
    audioInstance.loop = true;
  }

  audioInstance.currentTime = 0;
  const playPromise = audioInstance.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isBlocked = false;
        notify();
      })
      .catch((err) => {
        console.warn('Autoplay audio blocked by browser policy, trying Web Audio:', err);
        const webAudioSuccess = startWebAudioSiren();
        if (webAudioSuccess && webAudioCtx && webAudioCtx.state === 'running') {
          isBlocked = false;
        } else {
          isBlocked = true;
          setupUnlockListener();
        }
        notify();
      });
  } else {
    isBlocked = false;
    notify();
  }
}

export function stopSiren() {
  isActive = false;
  isBlocked = false;
  if (audioInstance) {
    try {
      audioInstance.pause();
      audioInstance.currentTime = 0;
    } catch {}
  }
  stopWebAudioSiren();
  notify();
}

export function isSirenActive() {
  return isActive;
}

export function isSirenBlocked() {
  return isBlocked;
}
