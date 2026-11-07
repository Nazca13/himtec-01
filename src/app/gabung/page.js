import { Suspense } from 'react';
import GabungGrup from '@/features/masuk/GabungGrup';
import { normalizeCode } from '@/lib/codes';

export const metadata = { title: 'Masuk sebagai pemantau' };

async function Form({ searchParams }) {
  const { kode } = await searchParams; // dari link undangan admin: /gabung?kode=XXXX
  return <GabungGrup kodeAwal={normalizeCode(kode)} />;
}

export default function GabungPage({ searchParams }) {
  return (
    <Suspense fallback={null}>
      <Form searchParams={searchParams} />
    </Suspense>
  );
}
