"use client";
import { motion } from "framer-motion";


export default function Terms() {

  return (
    <div className="py-20 flex items-center justify-center min-h-screen ">
      <main className="glass-container py-8 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-8xl font-bold text-center glass-title mb-4"
        >
          Terms
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg sm:text-2xl mb-6"
        >
          By using the app, you consent to these terms:
        </motion.p>

        {/* View Spotify account data */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg sm:text-2xl mb-6"
        >
            <p className="font-bold">View your Spotify account data </p>
            <ul className="text-lg sm:text-2xl mb-6">
                <li> Your email </li>
                <li> Your Spotify subscription, account, country, and explicit content filter settings.  </li>
                <li> Your name, username, profile picture, Spotify followers, and public playlists </li>                
            </ul>
        </motion.p>

        {/* View activity on Spotify */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg sm:text-2xl mb-6"
        >
            <p className="font-bold"> View your activity on Spotify </p>
            <ul className="text-lg sm:text-2xl mb-6">
                <li> What you've saved in Your Library </li>
                <li> Your top artists and content  </li>
                <li> Playlists you've created and playlists you follow </li>
                <li> Your collborative playlists </li>                
            </ul>
        </motion.p>

        {/* Take actions in Spotify on your behalf */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg sm:text-2xl mb-6"
        >
            <p className="font-bold"> Take actions in Spotify based on your behalf </p>
            <ul className="text-lg sm:text-2xl mb-6">
                <li> Create, edit, and follow private playlists </li>
                <li> Create, edit, and follow playlists </li>             
            </ul>
        </motion.p>

        
      </main>
    </div>
  );
}