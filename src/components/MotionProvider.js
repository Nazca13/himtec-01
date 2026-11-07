'use client';

import { LazyMotion, MotionConfig } from 'motion/react';

// Fitur animasi dimuat setelah halaman interaktif, bukan di bundle awal.
// strict: komponen harus memakai `m.*`, bukan `motion.*` (yang menarik seluruh library).
const loadFeatures = () => import('./MotionFeatures').then((mod) => mod.default);

// reducedMotion="user": pengguna yang mematikan animasi di sistemnya tidak melihat gerakan.
export default function MotionProvider({ children }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
