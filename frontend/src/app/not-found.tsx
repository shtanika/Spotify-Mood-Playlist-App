"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFoundPage() {
    
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        {/* error icon */}
        <div className="bg-black text-white rounded-full w-24 h-24 flex items-center justify-center text-5xl font-bold">
          !
        </div>
        <h1 className="text-4xl font-bold mt-4">Oops!</h1>
        <p className="text-gray-600 mt-2">We couldn't find the page you're looking for.</p>

        {/* Return to homepage button */}
        <Link href="/">
          <button className="mt-6 px-6 py-3 rounded-full bg-black text-white hover:bg-gray-800 transition">
            Return to Homepage
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
