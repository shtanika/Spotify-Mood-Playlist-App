"use client";

import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full backdrop-blur-md bg-white/20 border-t border-white/30 py-4 px-8 text-sm">
      <div className="w-full flex items-center justify-between">
        {/* center Links */}
        <div className="flex justify-center space-x-8 flex-grow ml-20">
          <Link href="/about" className="text-black hover:text-gray-600 transition-colors">
            About
          </Link>
          <Link href="/how-it-works" className="text-black hover:text-gray-600 transition-colors">
            How It Works
          </Link>
          <Link href="/help" className="text-black hover:text-gray-600 transition-colors">
            Help
          </Link>
          <Link href="/privacy" className="text-black hover:text-gray-600 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-black hover:text-gray-600 transition-colors">
            Terms
          </Link>
        </div>

        <div className="shrink-0">
          <p className="text-black">&copy; {new Date().getFullYear()} Moodify</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;