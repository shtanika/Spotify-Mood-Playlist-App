"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react"; 
import { BsSpotify } from "react-icons/bs"; 
import Image from "next/image"; 
import logo from "../../public/logo.png"; 
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const { data: session } = useSession(); 
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 shadow-xl bg-white text-black">
      <div className="flex justify-between items-center w-full py-3 px-8">
        {/* Logo & Title */}
        <Link href="/home" className="flex items-center gap-3 cursor-pointer">
          <Image src={logo} alt="Logo" width={40} height={40} />
          <span className="text-2xl font-bold" style={{ fontFamily: 'cursive' }}>Moodify</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link href="/home" className="text-black text-sm sm:text-base hover:text-gray-600">
            Home
          </Link>
          <Link href="/create" className="text-black text-sm sm:text-base hover:text-gray-600">
            Create
          </Link>

          {/* Signed In: Show User Icon, Profile Link, and Sign Out Button */}
          {session ? (
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <span className="text-black text-sm sm:text-base hover:text-gray-600 cursor-pointer">
                  Profile
                </span>
              </Link>
              <button
                onClick={() => signOut()}
                className="text-black text-sm sm:text-base hover:text-gray-600"
              >
                Sign Out
              </button>
              {session.user?.image && !imageError ? (
                <Image
                  src={session.user.image}
                  alt="User Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                  onError={handleImageError}
                />
              ) : (
                <FaUserCircle size={28} className="text-black" />
              )}
            </div>
          ) : (
            /* Not Signed In: Show Sign In Button */
            <button
              onClick={() => signIn("spotify")}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-black text-white gap-2 hover:bg-gray-800 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              <BsSpotify size={20} /> Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;