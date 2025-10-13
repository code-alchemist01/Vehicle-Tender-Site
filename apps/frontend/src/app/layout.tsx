import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Vehicle Auction Platform',
    template: '%s | Vehicle Auction Platform',
  },
  description: 'Enterprise-grade vehicle auction platform with real-time bidding',
  keywords: ['vehicle', 'auction', 'bidding', 'cars', 'marketplace'],
  authors: [{ name: 'Vehicle Auction Team' }],
  creator: 'Vehicle Auction Platform',
  publisher: 'Vehicle Auction Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    title: 'Vehicle Auction Platform',
    description: 'Enterprise-grade vehicle auction platform with real-time bidding',
    siteName: 'Vehicle Auction Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vehicle Auction Platform',
    description: 'Enterprise-grade vehicle auction platform with real-time bidding',
    creator: '@vehicleauction',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}