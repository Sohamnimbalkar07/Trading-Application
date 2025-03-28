import type { Metadata } from "next";
import localFont from "next/font/local";
import Appbar from "@/components/layout/Appbar";
import RecoilContextProvider from "@/lib/recoilContextProvider";
import "./globals.css";
import { Toaster} from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Exchange Project",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > 
        <RecoilContextProvider>
        <Appbar/>
        {children}
        <Toaster />
        </RecoilContextProvider>
      </body>
    </html>
  );
}
