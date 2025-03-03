"use client";

import React from "react";
import { signIn } from "next-auth/react"; 
import { BsSpotify } from "react-icons/bs"; 
import Image from "next/image"; 
import logo from "../../public/logo.png"; 

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 shadow-xl bg-white text-black">
      <div className="flex justify-between items-center w-full py-3 px-8">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <Image src={logo} alt="Logo" width={40} height={40} />
          <span className="text-2xl font-bold" style={{ fontFamily: 'cursive' }}>Moodify</span>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-6">
          <button className="text-black text-sm sm:text-base hover:text-gray-600">
            Home
          </button>
          <button className="text-black text-sm sm:text-base hover:text-gray-600">
            Create
          </button>

          {/* Sign In with Spotify Button */}
          <button
            onClick={() => signIn("spotify")}
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-black text-white gap-2 hover:bg-gray-800 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            <BsSpotify size={20} /> Sign in
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
