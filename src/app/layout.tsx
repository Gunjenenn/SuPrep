import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'SuuPrep — SAT Math',
  description: 'AI-powered SAT Math learning platform',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}
