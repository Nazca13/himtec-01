// Nama dari input pengguna: rapikan spasi, batasi panjang. Mengembalikan null jika tidak valid.
export function cleanName(value, max = 40) {
  const name = String(value ?? '').replace(/\s+/g, ' ').trim();
  return name.length >= 1 && name.length <= max ? name : null;
}
