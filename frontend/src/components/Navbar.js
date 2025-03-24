"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react"; 
import { BsSpotify } from "react-icons/bs"; 
import Image from "next/image"; 
import logo from "../../public/logo.png"; 
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const { data: session } = useSession(); 
  const [imageError, setImageError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleImageError = () => {
    setImageError(true);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

    
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-md text-black">
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

	    {/* Show Library Link if signed in */}
          {session && (
            <Link href="/library" className="text-black text-sm sm:text-base hover:text-gray-600">
              Library
            </Link>
          )}
	    
          {/* Signed In: Show User Icon, Profile Link, and Sign Out Button */}
          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={toggleDropdown}>
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

		</button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-30 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
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
