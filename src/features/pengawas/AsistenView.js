'use client';

import { useEffect, useRef, useState } from 'react';
import * as m from 'motion/react-m';
import { PiPaperPlaneRightFill } from 'react-icons/pi';
import Mascot from '@/components/ui/Mascot';
import styles from './AsistenView.module.css';

const SARAN = [
  'Rangkum kondisi lansia 3 hari terakhir',
  'Apakah ada keluhan hari ini?',
  'Kapan terakhir lansia memberi kabar?',
];

export default function AsistenView() {
  const [question, setQuestion] = useState('');
  const [thread, setThread] = useState([]); // { role: 'user' | 'ai' | 'error', text }
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [thread, loading]);

  const ask = async (text) => {
    const q = text.trim();
    if (!q || loading) return;
    setQuestion('');
    setThread((t) => [...t, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setThread((t) => [...t, { role: 'ai', text: data.answer }]);
    } catch (err) {
      setThread((t) => [...t, { role: 'error', text: err.message || 'Asisten sedang tidak tersedia.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.chat} aria-labelledby="judul-asisten">
      <h1 id="judul-asisten" className={styles.title}>
        Asisten AI
      </h1>

      <div className={styles.thread} aria-live="polite">
        {!thread.length && (
          <div className={styles.intro}>
            <Mascot size={84} />
            <p>Tanya apa saja soal kondisi lansia. Jawaban dibuat dari log aktivitas 7 hari terakhir.</p>
            <ul className={styles.chips}>
              {SARAN.map((s) => (
                <li key={s}>
                  <button onClick={() => ask(s)}>{s}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {thread.map((msg, i) => (
          <m.p
            key={i}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className={`${styles.msg} ${styles[msg.role]}`}
          >
            {msg.text}
          </m.p>
        ))}
        {loading && <p className={`${styles.msg} ${styles.ai} ${styles.typing}`}>Membaca log</p>}
        <div ref={endRef} />
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <label className="sr-only" htmlFor="pertanyaan">
          Pertanyaan
        </label>
        <input
          id="pertanyaan"
          className={styles.input}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={500}
          placeholder="Tanya kondisi lansia"
          autoComplete="off"
        />
        <button className={styles.send} type="submit" disabled={loading || !question.trim()} aria-label="Kirim pertanyaan">
          <PiPaperPlaneRightFill aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
