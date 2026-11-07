// Detektor kemungkinan KEJANG dan JATUH dari akselerometer HP (magnitudo percepatan termasuk gravitasi, m/s²).
// Fungsi murni tanpa API browser, sehingga bisa diuji dengan data buatan (scripts/test-deteksi.mjs).
//
// JATUH : jatuh bebas (magnitudo < 3) lalu benturan keras (> 25) dalam 1 detik.
// KEJANG: guncangan berirama: simpangan baku magnitudo per detik > 4 m/s² selama >= 10 detik berturut-turut.
//         Berjalan biasa ±1-2 m/s², jadi tidak memicu.
// Setelah memicu, detektor diam 60 detik agar tidak memicu berulang.
// Ini deteksi KEMUNGKINAN, bukan diagnosis: app selalu memberi 30 detik untuk membatalkan.
export const AMBANG = { jatuhBebas: 3, benturan: 25, sdKejang: 4, detikKejang: 10, jedaMs: 60_000 };

export function buatDetektor(onDeteksi) {
  const jendela = []; // sampel 1 detik terakhir: { t, mag }
  let detikGuncang = 0;
  let detikTerakhir = null;
  let jatuhBebasSampai = 0;
  let diamSampai = 0;

  const picu = (sebab, t) => {
    diamSampai = t + AMBANG.jedaMs;
    detikGuncang = 0;
    jatuhBebasSampai = 0;
    jendela.length = 0;
    onDeteksi(sebab);
  };

  return function proses({ t, mag }) {
    if (t < diamSampai || !Number.isFinite(mag)) return;

    if (mag < AMBANG.jatuhBebas) jatuhBebasSampai = t + 1000;
    else if (mag > AMBANG.benturan && t <= jatuhBebasSampai) return picu('JATUH', t);

    jendela.push({ t, mag });
    while (jendela.length && t - jendela[0].t > 1000) jendela.shift();

    const detik = Math.floor(t / 1000);
    if (detik === detikTerakhir || jendela.length < 10) return;
    detikTerakhir = detik;
    const rata = jendela.reduce((s, x) => s + x.mag, 0) / jendela.length;
    const sd = Math.sqrt(jendela.reduce((s, x) => s + (x.mag - rata) ** 2, 0) / jendela.length);
    detikGuncang = sd > AMBANG.sdKejang ? detikGuncang + 1 : 0;
    if (detikGuncang >= AMBANG.detikKejang) picu('KEJANG', t);
  };
}
