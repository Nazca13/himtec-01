// Sesi tanpa kata sandi: cookie httpOnly berisi { h: grup, r: peran, n: nama, v: versi } yang
// ditandatangani HMAC-SHA256. Web Crypto dipakai agar sama di proxy.js maupun route handler.
export const SESSION_COOKIE = 'sapa-session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // HP lansia harus tetap terhubung

const enc = new TextEncoder();

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET belum diisi (minimal 32 karakter).');
  return s;
}

const toB64 = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64 = (str) => Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

const hmacKey = () => crypto.subtle.importKey('raw', enc.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);

export async function signSession(payload) {
  const body = toB64(enc.encode(JSON.stringify({ ...payload, exp: Date.now() + SESSION_MAX_AGE * 1000 })));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(), enc.encode(body));
  return `${body}.${toB64(new Uint8Array(sig))}`;
}

// Mengembalikan payload, atau null jika tanda tangan salah, kedaluwarsa, atau rusak.
export async function verifySession(token) {
  try {
    const [body, sig] = (token ?? '').split('.');
    if (!body || !sig) return null;
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(), fromB64(sig), enc.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64(body)));
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

// Secure hanya jika koneksi HTTPS: tes lewat http://192.168.x.x di LAN tidak boleh menolak cookie.
export function sessionCookie(token, request) {
  const https = request.headers.get('x-forwarded-proto') === 'https' || new URL(request.url).protocol === 'https:';
  return { name: SESSION_COOKIE, value: token, httpOnly: true, sameSite: 'lax', secure: https, path: '/', maxAge: SESSION_MAX_AGE };
}
