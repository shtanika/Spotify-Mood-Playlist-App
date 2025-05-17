"use client";
import { motion } from "framer-motion";


export default function About() {

  return (
    <div className="py-20 flex items-center justify-center min-h-screen ">
      <main className="glass-container py-8 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-8xl font-bold text-center glass-title mb-4"
        >
          About Us
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg sm:text-2xl mb-6 text-gray-800 opacity-90"
        >
          Our team is passionate about music and AI-driven personalization. <br />  
          We believe current playlist generators lack the depth of true personalization and fail to match user moods accurately. <br />
          Existing recommendation systems often rely on genre-based matching rather than a nuanced understanding of emotional tone. <br />
          Our goal is to create a tool that better aligns with users’ emotions and listening habits to make music discovery easier and more customized. <br />
          We’re especially motivated by the challenge of improving music discovery through personalization. <br />
          Existing recommendation algorithms often fall short in capturing the nuances of mood-based music selection. <br />
          This project is an opportunity to apply real-world development skills while building something that improves the way people experience music. <br />
          We will be challenged to incorporate API integration, database management, and user authentication.

        </motion.p>

        
      </main>
    </div>
  );
}