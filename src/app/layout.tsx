import type { Metadata } from 'next';
import { Outfit, Syne } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const edoSZ = localFont({
  src: '../../public/fonts/EdoSZ.ttf',
  variable: '--font-edo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Maks Sushi — Dostawa Sushi & Japanese Food',
  description: 'Świeże sushi, zestawy i rolki z szybką dostawą w 30 minut. Najwyższa jakość, świeży łosoś i tradycyjne japońskie receptury.',
  icons: {
    icon: '/images/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" suppressHydrationWarning className={`${outfit.variable} ${syne.variable} ${edoSZ.variable} dark antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const origSetAttr = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, value) {
                    if (name === 'bis_skin_checked') return;
                    return origSetAttr.apply(this, arguments);
                  };
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-[#e50914] selection:text-white">
        {children}
      </body>
    </html>
  );
}
