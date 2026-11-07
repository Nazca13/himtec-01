'use client';

import { useCallback, useRef } from 'react';

const MIME_PILIHAN = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'];

const toBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const WAV_RATE = 16000; // cukup untuk ucapan, dan menjaga ukuran kecil (~32 KB/detik)

// Chrome merekam webm, Safari mp4. Keduanya diubah ke WAV mono agar model AI menerimanya.
async function toWav(blob) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const ctx = new Ctx();
  const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
  ctx.close();

  const off = new Offline(1, Math.max(1, Math.ceil(decoded.duration * WAV_RATE)), WAV_RATE);
  const src = off.createBufferSource();
  src.buffer = decoded;
  src.connect(off.destination);
  src.start();
  const pcm = (await off.startRendering()).getChannelData(0);

  const view = new DataView(new ArrayBuffer(44 + pcm.length * 2));
  const text = (at, str) => [...str].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + pcm.length * 2, true);
  text(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, WAV_RATE, true);
  view.setUint32(28, WAV_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, pcm.length * 2, true);
  pcm.forEach((x, i) => view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, x)) * 0x7fff, true));
  return new Blob([view], { type: 'audio/wav' });
}

export function useRecorder() {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MIME_PILIHAN.find((m) => MediaRecorder.isTypeSupported(m));
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    recorder.start();
    recorderRef.current = recorder;
  }, []);

  // Menghentikan rekaman, melepas mikrofon, lalu mengembalikan audio base64.
  const stop = useCallback(
    () =>
      new Promise((resolve, reject) => {
        const recorder = recorderRef.current;
        if (!recorder) return reject(new Error('Tidak sedang merekam'));
        recorder.onstop = async () => {
          recorder.stream.getTracks().forEach((t) => t.stop());
          recorderRef.current = null;
          try {
            const wav = await toWav(new Blob(chunksRef.current, { type: recorder.mimeType }));
            resolve({ audioBase64: await toBase64(wav), mimeType: 'audio/wav' });
          } catch (err) {
            reject(err);
          }
        };
        recorder.stop();
      }),
    []
  );

  return { start, stop };
}
