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
            const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
            resolve({ audioBase64: await toBase64(blob), mimeType: recorder.mimeType });
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
