import { Geist, Geist_Mono, Open_Sans } from "next/font/google"; 
import "./globals.css";
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer';
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const openSans = Open_Sans({ // Add Open Sans
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Moodify",
  description: "Create custom Spotify playlists",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${openSans.variable} antialiased`}
      >
          <AuthProvider>
          <Navbar />
          <div className="bg-pastel-gradient min-h-screen">
          <main className="flex-grow">{children}</main>
          </div>
	        <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
