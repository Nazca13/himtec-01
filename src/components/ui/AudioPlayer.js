'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { PiPauseFill, PiPlayFill, PiSpinnerGapBold } from 'react-icons/pi';
import styles from './AudioPlayer.module.css';

// 24 bar visual gelombang suara (seperti pesan suara iOS/WA)
const WAVE_HEIGHTS = [
  35, 60, 45, 80, 55, 90, 70, 40, 65, 85, 100, 75,
  50, 85, 65, 95, 80, 60, 45, 70, 50, 40, 30, 25,
];

const SPEEDS = [1, 1.5, 2];

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function AudioPlayer({ record, compact = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [loadError, setLoadError] = useState(false);

  const audioRef = useRef(null);
  const waveRef = useRef(null);
  const audioId = useId();

  const transkrip = record?.aiAnalysis?.transkrip;

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio(`/api/audio/${record.id}`);
      audio.preload = 'metadata';

      audio.onloadedmetadata = () => {
        setDuration(audio.duration || 0);
        setIsLoading(false);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.onerror = () => {
        setIsLoading(false);
        setIsPlaying(false);
        setLoadError(true);
      };

      audio.playbackRate = SPEEDS[speedIdx];
      audioRef.current = audio;
    }
    return audioRef.current;
  }, [record.id, speedIdx]);

  const togglePlay = async () => {
    try {
      const audio = initAudio();
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audio.play();
        setIsLoading(false);
        setIsPlaying(true);
      }
    } catch {
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const cycleSpeed = () => {
    const nextIdx = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(nextIdx);
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEEDS[nextIdx];
    }
  };

  const handleSeek = (e) => {
    if (!waveRef.current || !duration) return;
    const rect = waveRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * duration;
    setCurrentTime(newTime);
    const audio = initAudio();
    audio.currentTime = newTime;
  };

  const progressRatio = duration > 0 ? currentTime / duration : 0;
  const activeBarsCount = Math.floor(progressRatio * WAVE_HEIGHTS.length);

  return (
    <div className={`${styles.player} ${compact ? styles.playerCompact : ''}`}>
      <div className={styles.mainRow}>
        <button
          type="button"
          className={styles.playBtn}
          onClick={togglePlay}
          aria-label={isPlaying ? 'Jeda pesan suara' : 'Putar pesan suara'}
          disabled={loadError}
        >
          {isLoading ? (
            <PiSpinnerGapBold className={styles.spinner} aria-hidden="true" />
          ) : isPlaying ? (
            <PiPauseFill aria-hidden="true" />
          ) : (
            <PiPlayFill style={{ marginLeft: 2 }} aria-hidden="true" />
          )}
        </button>

        <div className={styles.track}>
          <div
            ref={waveRef}
            className={styles.waveContainer}
            onClick={handleSeek}
            role="progressbar"
            aria-valuenow={Math.round(progressRatio * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            aria-label="Progres pemutaran suara"
          >
            {WAVE_HEIGHTS.map((h, i) => {
              const isActive = i <= activeBarsCount;
              const isAnimating = isPlaying && Math.abs(i - activeBarsCount) <= 2;
              return (
                <div
                  key={`${audioId}-${i}`}
                  className={`${styles.waveBar} ${isActive ? styles.waveActive : ''} ${isAnimating ? styles.waveBarPlaying : ''}`}
                  style={{
                    height: `${h}%`,
                    animationDelay: `${(i % 5) * 0.15}s`,
                  }}
                />
              );
            })}
          </div>

          <div className={styles.metaRow}>
            <span>
              {formatTime(currentTime)} / {formatTime(duration || 0)}
            </span>
            <button
              type="button"
              className={styles.speedBtn}
              onClick={cycleSpeed}
              aria-label={`Kecepatan putar ${SPEEDS[speedIdx]}x`}
            >
              {SPEEDS[speedIdx]}x
            </button>
          </div>
        </div>
      </div>

      {transkrip && (
        <div className={styles.transkripBox}>
          <span className={styles.transkripLabel}>🗣️ Kata lansia:</span>
          &ldquo;{transkrip}&rdquo;
        </div>
      )}
    </div>
  );
}
