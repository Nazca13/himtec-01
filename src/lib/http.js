// Panggilan JSON yang tidak melempar: selalu mengembalikan { ok, status, data }.
export async function requestJson(url, { method = 'GET', body } = {}) {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) };
  } catch {
    return { ok: false, status: 0, data: { error: 'Tidak ada koneksi internet. Coba lagi.' } };
  }
}

export const postJson = (url, body) => requestJson(url, { method: 'POST', body: body ?? {} });
