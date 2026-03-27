import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Acoru Estimate Starter',
  description: 'Build-safe Next.js + Neon Postgres starter.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
