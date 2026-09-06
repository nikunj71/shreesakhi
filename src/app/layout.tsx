import type { Metadata, Viewport } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';
import { ClientProvider } from '@/components/providers/ClientProvider';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ShreeSakhi | Royal Choli Rental Boutique',
  description: 'Luxury Ethnic Outfit Rental, Inventory ROI Tracking, and Booking Management System',
  appleWebApp: {
    capable: true,
    title: 'ShreeSakhi',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('shreesakhi_theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#FAF8F5] text-[#1C1917] dark:bg-[#041A17] dark:text-[#FAF6EC] antialiased selection:bg-[#DFBD76] selection:text-[#041A17]">
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
