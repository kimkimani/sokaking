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

// Option 1: Dynamic Athletic Tech
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', weight: ['700', '800'], display: 'swap' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta', weight: ['400', '500', '600', '700'], display: 'swap' });

// Option 2: Ultra Wide Future Gaming
const unbounded = Unbounded({ subsets: ['latin'], variable: '--font-unbounded', weight: ['700', '800'], display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', weight: ['400', '500', '600', '700'], display: 'swap' });

// Option 3: Heavy Stadium Broadcast
const chivo = Chivo({ subsets: ['latin'], variable: '--font-chivo', weight: ['800', '900'], display: 'swap' });
const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', weight: ['400', '500', '600', '700'], display: 'swap' });

// Option 4: High-Precision Scoreboard
const rajdhani = Rajdhani({ subsets: ['latin'], variable: '--font-rajdhani', weight: ['600', '700'], display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['400', '500', '600', '700'], display: 'swap' });

// Option 5: Modern Sports Media
const schibsted = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-schibsted', weight: ['700', '800'], display: 'swap' });
const albert = Albert_Sans({ subsets: ['latin'], variable: '--font-albert', weight: ['400', '500', '600', '700'], display: 'swap' });

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500', '700'], display: 'swap' });

export const metadata = {
  title: 'Soka King - Premium Sports Predictions & Jackpots',
  description: 'AI-Powered premium football tips, custom analytical tools, VIP packages, and major jackpots',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/favicon.svg', type: 'image/svg+xml' }]
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;600;700&family=Anton&family=Atkinson+Hyperlegible:wght@400;700&family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;600&family=Bebas+Neue&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Chivo:wght@800;900&family=Cinzel:wght@700;800&family=DM+Sans:wght@400;600;700&family=Exo+2:wght@600;700&family=Figtree:wght@400;600;700&family=Inter:wght@400;600;700;800&family=Kanit:wght@600;700;800&family=Lato:wght@400;700&family=Lexend:wght@600;700&family=Manrope:wght@500;700;800&family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;600;700&family=Orbitron:wght@700;800&family=Oswald:wght@600;700&family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Prompt:wght@600;700&family=Public+Sans:wght@500;700;800&family=Rajdhani:wght@600;700&family=Righteous&family=Rubik:wght@600;700;800&family=Saira+Extra+Condensed:wght@700;800&family=Schibsted+Grotesk:wght@700;800&family=Space+Grotesk:wght@600;700&family=Sora:wght@600;700;800&family=Syne:wght@700;800&family=Teko:wght@600;700&family=Unbounded:wght@700;800&family=Urbanist:wght@600;700&family=Work+Sans:wght@500;700;800&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://cheerplex.co.ke" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cheerplex.co.ke" />
        <link rel="preconnect" href="https://flagcdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://flagcdn.com" />
        <link rel="preconnect" href="https://media.api-sports.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://media.api-sports.io" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}


