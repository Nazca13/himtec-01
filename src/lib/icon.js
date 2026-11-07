import { ImageResponse } from 'next/og';

// Ikon PWA: huruf S biru tua di ubin biru es. Padding 20% agar aman untuk "maskable".
export function renderIcon(size) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#112a46',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60%',
            height: '60%',
            background: '#ebf5fb',
            color: '#112a46',
            fontSize: size * 0.42,
            fontWeight: 900,
          }}
        >
          S
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
