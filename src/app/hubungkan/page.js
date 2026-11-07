import { Suspense } from 'react';
import HubungkanLansia from '@/features/masuk/HubungkanLansia';
import { normalizeCode } from '@/lib/codes';

export const metadata = { title: 'Peduli hari ini, untuk mereka nanti — SAPA' };

async function Form({ searchParams }) {
  const { kode } = await searchParams; // dari link WhatsApp: /hubungkan?kode=XXXXXX
  return <HubungkanLansia kodeAwal={normalizeCode(kode)} />;
}

export default function HubungkanPage({ searchParams }) {
  return (
    <Suspense fallback={null}>
      <Form searchParams={searchParams} />
    </Suspense>
  );
}
