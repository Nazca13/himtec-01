import { Suspense } from 'react';
import GabungGrup from '@/features/masuk/GabungGrup';
import { normalizeCode } from '@/lib/codes';

export const metadata = { title: 'Gabung ke grup' };

async function Form({ searchParams }) {
  const { kode } = await searchParams; // dari link undangan: /gabung?kode=XXXX
  return <GabungGrup kodeAwal={normalizeCode(kode)} />;
}

export default function GabungPage({ searchParams }) {
  return (
    <Suspense fallback={null}>
      <Form searchParams={searchParams} />
    </Suspense>
  );
}
