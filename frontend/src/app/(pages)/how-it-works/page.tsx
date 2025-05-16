"use client";
import { motion } from "framer-motion";


export default function HowItWorks() {

  return (
    <div className="py-20 flex items-center justify-center min-h-screen ">
      <main className="glass-container py-8 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-8xl font-bold text-center glass-title mb-4"
        >
          How it works
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg sm:text-2xl mb-6"
        >
          Our project is a web-based application that generates personalized playlists for Spotify users based on their mood input and listening history. <br />
          By leveraging the publicly-available Spotify Web API and the Gemini API, the system will analyze a user’s top tracks and top artists to create a <br />
          playlist that accurately matches their selected mood. Users will input a mood, and the app will retrieve their top tracks, and favorite artists to <br />
          filter recommended tracks. 

        </motion.p>

        
      </main>
    </div>
  );
}