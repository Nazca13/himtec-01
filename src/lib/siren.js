// src/lib/siren.js
// Pengelola audio sirine ambulans tangguh untuk situasi darurat lansia & pengawas.
// Mendukung pemutaran file MP3 (/alert/ambulance-2.mp3), fallback Web Audio API oscillator,
// sinkronisasi pesan lintas iframe (postMessage), dan penanganan otomatis kebijakan autoplay peramban modern.

let audioInstance = null;
let webAudioCtx = null;
let webAudioNodes = null;
let isActive = false;
let isBlocked = false;
let audioUnlocked = false;
const listeners = new Set();
let unlockListenerAdded = false;
let globalUnlockInitialized = false;
let messageListenerAdded = false;

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

function getWebAudioContext() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!webAudioCtx || webAudioCtx.state === 'closed') {
    webAudioCtx = new Ctx();
  }
  return webAudioCtx;
}

function startWebAudioSiren() {
  if (typeof window === 'undefined') return false;
  try {
    const ctx = getWebAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    stopWebAudioSiren();

    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const mainGain = ctx.createGain();

    // Nada sirine ambulans darurat (two-tone wailing sweep)
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(820, ctx.currentTime);

    // Modulasi frekuensi 680 Hz - 980 Hz pada kecepatan 1.8 Hz
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(1.8, ctx.currentTime);
    lfoGain.gain.setValueAtTime(160, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    mainGain.gain.setValueAtTime(0.4, ctx.currentTime);

    osc.connect(mainGain);
    mainGain.connect(ctx.destination);

    osc.start();
    lfo.start();

    webAudioNodes = { osc, lfo, mainGain };
    return ctx.state === 'running';
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

function getAudioElement() {
  if (typeof window === 'undefined') return null;
  if (!audioInstance) {
    audioInstance = new Audio('/alert/ambulance-2.mp3');
    audioInstance.loop = true;
    audioInstance.preload = 'auto';
  }
  return audioInstance;
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

    const ctx = getWebAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (isActive) {
      const audio = getAudioElement();
      if (audio) {
        audio.currentTime = 0;
        audio.volume = 1.0;
        audio
          .play()
          .then(() => {
            isBlocked = false;
            stopWebAudioSiren();
            notify();
          })
          .catch(() => {
            startWebAudioSiren();
            isBlocked = false;
            notify();
          });
      } else {
        startWebAudioSiren();
        isBlocked = false;
        notify();
      }
    }
  };

  window.addEventListener('pointerdown', onUserGesture, true);
  window.addEventListener('click', onUserGesture, true);
  window.addEventListener('keydown', onUserGesture, true);
  window.addEventListener('touchstart', onUserGesture, true);
}

// Inisialisasi pemanasan audio saat ada sentuhan pertama pengguna di aplikasi
export function initAudioUnlocker() {
  if (typeof window === 'undefined') return;

  // Pasang listener pesan postMessage untuk sinkronisasi jika dijalankan di mode demo / iframe
  if (!messageListenerAdded) {
    messageListenerAdded = true;
    window.addEventListener('message', (e) => {
      if (e.data?.sapa === 'play-siren') {
        playSiren(false);
      } else if (e.data?.sapa === 'stop-siren') {
        stopSiren(false);
      }
    });
  }

  if (globalUnlockInitialized) return;
  globalUnlockInitialized = true;

  const unlock = () => {
    window.removeEventListener('pointerdown', unlock, true);
    window.removeEventListener('click', unlock, true);
    window.removeEventListener('keydown', unlock, true);
    window.removeEventListener('touchstart', unlock, true);

    audioUnlocked = true;

    // 1. Bangunkan AudioContext
    try {
      const ctx = getWebAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {}

    // 2. Priming HTML5 Audio element agar diizinkan autoplay oleh Chrome/Safari
    try {
      const audio = getAudioElement();
      if (audio) {
        audio.volume = 0.001;
        const p = audio.play();
        if (p !== undefined) {
          p.then(() => {
            if (!isActive) {
              audio.pause();
              audio.currentTime = 0;
            }
            audio.volume = 1.0;
          }).catch(() => {
            audio.volume = 1.0;
          });
        }
      }
    } catch {}
  };

  window.addEventListener('pointerdown', unlock, true);
  window.addEventListener('click', unlock, true);
  window.addEventListener('keydown', unlock, true);
  window.addEventListener('touchstart', unlock, true);
}

export function playSiren(broadcast = true) {
  if (typeof window === 'undefined') return;
  isActive = true;

  // Jika berada di dalam iframe (seperti pada /demo), kirim sinyal ke window utama
  if (broadcast && window !== window.top) {
    try {
      window.top?.postMessage({ sapa: 'play-siren' }, '*');
    } catch {}
  }

  const audio = getAudioElement();
  if (audio) {
    audio.volume = 1.0;
    if (audio.paused) {
      audio.currentTime = 0;
    }
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isBlocked = false;
          stopWebAudioSiren();
          notify();
        })
        .catch((err) => {
          console.warn('Autoplay audio blocked by browser policy, falling back to Web Audio:', err);
          const webAudioSuccess = startWebAudioSiren();
          isBlocked = !webAudioSuccess;
          setupUnlockListener();
          notify();
        });
    } else {
      isBlocked = false;
      notify();
    }
  } else {
    startWebAudioSiren();
    notify();
  }
}

export function stopSiren(broadcast = true) {
  isActive = false;
  isBlocked = false;

  // Jika berada di dalam iframe, hentikan juga di window utama
  if (broadcast && window !== window.top) {
    try {
      window.top?.postMessage({ sapa: 'stop-siren' }, '*');
    } catch {}
  }

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
