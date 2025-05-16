"use client";
import { motion } from "framer-motion";


export default function Privacy() {

  return (
    <div className="py-20 flex items-center justify-center min-h-screen ">
      <main className="glass-container py-8 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-8xl font-bold text-center glass-title mb-4"
        >
          Privacy
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg sm:text-2xl mb-6"
        >
          We use the following Spotify Data to generate a playlist based on your mood.
          
        </motion.p>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg sm:text-2xl mb-6"
        >
            <p className="font-bold"> The following data collected from your Spotify account </p>
            <ul>
                <li> Top Tracks </li>
                <li> Top Artists </li>
                <li> Saved Tracks </li>
                <li> Playlists </li>
                <li> User Details (e.g. display name, email)</li>
            </ul>
          
        </motion.p>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg sm:text-2xl mb-6"
        >
            <p className="font-bold"> What is used with that data </p>
            <ul>
                <li> 1. Playlist generation for recommended tracks based on mood (top tracks, top artists) </li>
                <li> 2. Listing and displaying user information, user details, playlists, tracks  </li> 
            </ul>
          
        </motion.p>
    
       
        
      </main>
    </div>
  );
}