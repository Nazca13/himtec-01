const RETRY = 3;

async function postJson(url, body) {
  let lastError;
  for (let i = 0; i < RETRY; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) return res.json();
      if (res.status === 401) throw new Error('putus'); // sesi tidak berlaku: HP diputus keluarga
      // 4xx = permintaan salah, mengulang tidak membantu.
      if (res.status < 500) throw new Error('Permintaan ditolak');
      lastError = new Error('Server gagal');
    } catch (err) {
      lastError = err;
      if (err.message === 'Permintaan ditolak' || err.message === 'putus') break;
    }
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  throw lastError;
}

export const kirimTombol = (tipeInput) => postJson('/api/record', { tipeInput });
export const kirimSuara = ({ audioBase64, mimeType }) => postJson('/api/ai', { audioBase64, mimeType });
