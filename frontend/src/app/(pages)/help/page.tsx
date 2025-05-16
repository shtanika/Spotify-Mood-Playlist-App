"use client";
import { motion } from "framer-motion";


export default function Help() {

  return (
    <div className="py-20 flex items-center justify-center min-h-screen ">
      <main className="glass-container py-8 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-8xl font-bold text-center glass-title mb-4"
        >
          Need Help?
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg sm:text-2xl mb-6"
        >
          Contact Us <br />
           
          jlinang06@gmail.com

        </motion.p>

        
      </main>
    </div>
  );
}