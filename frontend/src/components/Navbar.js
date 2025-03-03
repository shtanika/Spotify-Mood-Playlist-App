"use client";

import React from "react";
import { signIn } from "next-auth/react"; 
import { BsSpotify } from "react-icons/bs"; 
import Image from "next/image"; 

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 shadow-xl bg-black text-white">
      <div className="flex justify-between items-center w-full py-3 px-8">
        {/* Logo */}


        {/* Navigation Buttons */}
        <div className="flex items-center gap-6">
          <button className="text-white text-sm sm:text-base hover:text-gray-400">
            Home
          </button>
          <button className="text-white text-sm sm:text-base hover:text-gray-400">
            Create
          </button>

          {/* Sign In with Spotify Button */}
          <button
            onClick={() => signIn("spotify")}
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            <BsSpotify size={20} /> Sign in
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
