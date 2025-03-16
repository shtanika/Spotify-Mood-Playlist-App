'use client';

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      
      {/* large black rectangle main section*/}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="bg-black text-white rounded-2xl p-10 w-full max-w-5xl flex flex-col sm:flex-row justify-between items-start gap-8 mt-[-30px]"
      >
        {/* three gray smaller sections */}
        {[
          { title: "Sign in to Spotify", text: "For deeper personalization!" },
          { title: "Enter a prompt", text: "Let us know how you are feeling!" },
          { title: "Generate your playlist", text: "Create the perfect playlist based on your mood and listening history!" }
        ].map(({ title, text }, index) => (
          <div key={index} className="bg-gray-700 rounded-xl p-6 flex-1 text-center min-h-[150px] flex flex-col">
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-base mt-2 text-gray-300">{text}</p>
          </div>
        ))}
      </motion.div>

      <button
          onClick={() => signIn("spotify")}
          className="btn"
        >
          <span className="flex items-center justify-center relative z-10">
            CREATE MY CUSTOM PLAYLIST
            <ChevronRight className="w-6 h-6 ml-2" />
          </span>

        </button>
      
    </div>
  );
}
