import type { Metadata } from "next";
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
        url: "/og-image.png",
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
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-dvh">
        {children}
      </body>
    </html>
  );
}
