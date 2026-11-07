// Uji detektor kejang/jatuh dengan data sensor buatan (60 sampel/detik). Jalankan: npm run test:deteksi
import assert from 'node:assert/strict';
import { buatDetektor } from '../src/lib/deteksi.js';

const HZ = 60;
function jalankan(detik, magPada) {
  const hasil = [];
  const proses = buatDetektor((sebab) => hasil.push(sebab));
  for (let i = 0; i < detik * HZ; i++) {
    const t = (i / HZ) * 1000;
    proses({ t, mag: magPada(t / 1000) });
  }
  return hasil;
}
const derau = () => (Math.random() - 0.5) * 0.4;

const kasus = [
  ['HP diam di meja 60 detik', jalankan(60, () => 9.81 + derau()), []],
  ['berjalan 60 detik (ayunan ±2,5 m/s², 2 Hz)', jalankan(60, (s) => 9.81 + 2.5 * Math.sin(2 * Math.PI * 2 * s) + derau()), []],
  ['HP dibanting ke kasur tanpa jatuh bebas', jalankan(5, (s) => (s > 2 && s < 2.05 ? 30 : 9.81)), []],
  ['kejang 15 detik (guncangan ±9 m/s², 4 Hz)', jalankan(15, (s) => 9.81 + 9 * Math.sin(2 * Math.PI * 4 * s)), ['KEJANG']],
  ['guncangan hanya 5 detik (bukan kejang)', jalankan(8, (s) => (s < 5 ? 9.81 + 9 * Math.sin(2 * Math.PI * 4 * s) : 9.81)), []],
  ['jatuh: 0,3 dtk jatuh bebas lalu benturan', jalankan(5, (s) => (s > 2 && s < 2.3 ? 1 : s >= 2.3 && s < 2.35 ? 35 : 9.81)), ['JATUH']],
  ['kejang 40 detik hanya memicu sekali (jeda 60 dtk)', jalankan(40, (s) => 9.81 + 9 * Math.sin(2 * Math.PI * 4 * s)), ['KEJANG']],
];

let gagal = 0;
for (const [nama, dapat, harus] of kasus) {
  try {
    assert.deepEqual(dapat, harus);
    console.log(`  OK    ${nama} -> ${JSON.stringify(dapat)}`);
  } catch {
    gagal++;
    console.log(`  GAGAL ${nama}: harus ${JSON.stringify(harus)}, dapat ${JSON.stringify(dapat)}`);
  }
}
console.log(gagal ? `\n${gagal} gagal` : `\nSemua ${kasus.length} kasus lulus`);
process.exitCode = gagal ? 1 : 0;
