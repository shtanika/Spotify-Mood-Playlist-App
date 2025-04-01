import { Inter } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer';
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const clashDisplay = localFont({
  src: [
    {
      path: '../../public/fonts/ClashDisplay-Variable.woff2',
      style: 'normal',
    },
  ],
  variable: '--font-clash-display',
});

export const metadata = {
  title: "Moodify",
  description: "Create custom Spotify playlists",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${clashDisplay.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          <div className="bg-gradient-animate min-h-screen">
            <main className="flex-grow">{children}</main>
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
