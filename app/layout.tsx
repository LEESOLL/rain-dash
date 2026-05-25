import type { Metadata, Viewport } from "next";
import { InteractionGuard } from "@/components/InteractionGuard";
import "./globals.css";

const DESCRIPTION = "Time moves when you move! 빨리 갈까 천천히 갈까?";

export const metadata: Metadata = {
  metadataBase: new URL("https://rain-dash.vercel.app"),
  title: "Rain Dash",
  description: DESCRIPTION,
  openGraph: {
    title: "Rain Dash",
    description: DESCRIPTION,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rain Dash",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rain Dash",
    description: DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-dvh">
        {/* 폰트 프리로드 */}
        <link
          rel="preload"
          href="/fonts/PFStardust-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/PFStardust-Bold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/PFStardust-ExtraBold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        {/* 이미지 프리로드*/}
        <link rel="preload" href="/sprites/ui/title.webp" as="image" />
        <link
          rel="preload"
          href="/sprites/background/street-bg.webp"
          as="image"
        />
        {[
          "/sprites/items/umbrella.webp",
          "/sprites/items/boots.webp",
          "/sprites/items/raincoat.webp",
          "/sprites/items/heart.webp",
          "/sprites/effects/rain.webp",
          "/sprites/effects/thunder.webp",
          "/sprites/effects/puddle_short.webp",
          "/sprites/objects/awning.webp",
          "/sprites/objects/bus_stop.webp",
          "/sprites/objects/phone_booth.webp",
          "/sprites/objects/house.webp",
        ].map((href) => (
          <link key={href} rel="prefetch" as="image" href={href} />
        ))}
        <InteractionGuard />
        {children}
      </body>
    </html>
  );
}
