import PengawasShell from '@/features/pengawas/PengawasShell';
import RecordsProvider from '@/features/pengawas/RecordsProvider';

export const metadata = { title: { default: 'SAPA - Keluarga', template: '%s | SAPA' } };

export default function PengawasLayout({ children }) {
  return (
    <RecordsProvider>
      <PengawasShell>{children}</PengawasShell>
    </RecordsProvider>
  );
}
