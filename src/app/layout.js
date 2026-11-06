import "./globals.css";

export const metadata = {
  title: "Hackathon God-Mode Boilerplate",
  description: "High-speed, stable, flexible boilerplate for Hackathons",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
