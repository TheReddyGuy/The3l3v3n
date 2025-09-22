import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fantasy FicBall',
  description: 'Custom fantasy baseball engine for fictional leagues'
};

export default function RootLayout(
  props: Readonly<{ children: React.ReactNode }>
) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto max-w-5xl p-6">
          <header className="mb-8">
            <h1 className="text-2xl font-bold">Fantasy FicBall</h1>
            <p className="text-sm text-gray-600">
              Build leagues with any players, positions, and stats.
            </p>
          </header>
          {props.children}
        </div>
      </body>
    </html>
  );
}
