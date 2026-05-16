import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rain Dash",
  description: "비 오는 거리를 안 젖고 도착하기 — 시간 결합 러너",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
