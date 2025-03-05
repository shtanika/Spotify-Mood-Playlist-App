"use client";

import React from "react";
import Link from "next/link";

const Footer = () => {
    
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-800 text-white py-4 px-8 text-sm">
	<div className="w-full flex items-center justify-between">
	    
        {/* center Links */}
        <div className="flex justify-center space-x-8 flex-grow ml-20">
          <Link href="/about" className="hover:text-gray-400">
            About
          </Link>
          <Link href="/how-it-works" className="hover:text-gray-400">
            How It Works
          </Link>
          <Link href="/help" className="hover:text-gray-400">
            Help
          </Link>
          <Link href="/privacy" className="hover:text-gray-400">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-gray-400">
            Terms
          </Link>
        </div>

        <div className="shrink-0">
          <p>&copy; {new Date().getFullYear()} Moodify</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
