import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '営業専用 概算見積ツール | Phase 1',
  description: '営業専用の概算見積ツール Phase 1 UI土台。ロジック未実装の静的ベース画面。'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
