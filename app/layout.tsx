import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Forest Sentinel - Real-time Forest Risk Monitoring',
  description: 'AI-powered forest risk detection using satellite data from ESA Sentinel-1 SAR, NASA MODIS, and FIRMS.',
  keywords: 'forest monitoring, wildfire detection, satellite data, NASA, ESA, Sentinel-1, SAR, MODIS, FIRMS, deforestation, climate change',
  authors: [{ name: 'Forest Sentinel Team' }],
  openGraph: {
    title: 'Forest Sentinel - Satellite Forest Monitoring',
    description: 'Real-time forest risk monitoring using satellite data',
    url: 'https://forest-sentinel.vercel.app',
    siteName: 'Forest Sentinel',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Forest Sentinel - Satellite Monitoring',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forest Sentinel',
    description: 'Real-time forest monitoring with satellite data',
    images: ['/og-image.png'],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}