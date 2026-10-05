import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: { default: 'Dobara — Buy & sell pre-loved things near you', template: '%s · Dobara' },
  description: 'Buy and sell secondhand items in your neighbourhood. Chat with the seller, agree a price, pay safely and get it delivered or pick it up.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" />
        {/* Design system from the UI kit — kept as-is so every screen matches the design. */}
        <link rel="stylesheet" href="/dobara.css" />
        <link rel="stylesheet" href="/app.css" />
      </head>
      <body>
        <div className="db">
          <div className="stage">
            <div className="device dv-desktop">
              <div className="scroller">{children}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
