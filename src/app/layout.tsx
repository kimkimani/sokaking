import '../index.css';
import { ReactNode } from 'react';
import { 
  Bricolage_Grotesque,
  Plus_Jakarta_Sans,
  Unbounded,
  DM_Sans,
  Chivo,
  Figtree,
  Rajdhani,
  Outfit,
  Schibsted_Grotesk,
  Albert_Sans,
  JetBrains_Mono 
} from 'next/font/google';

// Dynamic Athletic Tech
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', weight: ['700', '800'], display: 'swap' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta', weight: ['400', '500', '600', '700'], display: 'swap' });

// Ultra Wide Future Gaming
const unbounded = Unbounded({ subsets: ['latin'], variable: '--font-unbounded', weight: ['700', '800'], display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', weight: ['400', '500', '600', '700'], display: 'swap' });

// Heavy Stadium Broadcast
const chivo = Chivo({ subsets: ['latin'], variable: '--font-chivo', weight: ['800', '900'], display: 'swap' });
const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', weight: ['400', '500', '600', '700'], display: 'swap' });

// High-Precision Scoreboard
const rajdhani = Rajdhani({ subsets: ['latin'], variable: '--font-rajdhani', weight: ['600', '700'], display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['400', '500', '600', '700'], display: 'swap' });

// Modern Sports Media
const schibsted = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-schibsted', weight: ['700', '800'], display: 'swap' });
const albert = Albert_Sans({ subsets: ['latin'], variable: '--font-albert', weight: ['400', '500', '600', '700'], display: 'swap' });

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500', '700'], display: 'swap' });

export const metadata = {
  title: 'Soka King - Premium Sports Predictions & Jackpots',
  description: 'AI-Powered premium football tips, custom analytical tools, VIP packages, and major jackpots',
  icons: {
    icon: [
      { url: '/favicon.svg?v=sk', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png?v=sk', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=sk', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-48x48.png?v=sk', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png?v=sk', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico?v=sk' }
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=sk', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'manifest', url: '/site.webmanifest?v=sk' }
    ]
  }
};

const fontVariables = [
  bricolage.variable, plusJakarta.variable,
  unbounded.variable, dmSans.variable,
  chivo.variable, figtree.variable,
  rajdhani.variable, outfit.variable,
  schibsted.variable, albert.variable,
  jetbrainsMono.variable
].join(' ');

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <head>
        <link rel="preconnect" href="https://cheerplex.co.ke" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cheerplex.co.ke" />
        <link rel="preconnect" href="https://flagcdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://flagcdn.com" />
        <link rel="preconnect" href="https://media.api-sports.io" />
        <link rel="dns-prefetch" href="https://media.api-sports.io" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=sk" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=sk" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=sk" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v=sk" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png?v=sk" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=sk" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?v=sk" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=sk" />
        <link rel="manifest" href="/site.webmanifest?v=sk" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
