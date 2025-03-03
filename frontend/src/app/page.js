"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        
        {/* Animated heading */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-8xl font-bold text-center"
        >
          PLAYLISTS<br />
          BASED ON<br />
          YOUR MOOD
        </motion.h1>

        <motion.button
          onClick={() => signIn("spotify")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-lg sm:text-xl h-10 sm:h-12 px-6 sm:px-8 mt-16"
          >
	  <span className="flex items-center justify-center">
            CREATE MY CUSTOM PLAYLIST
            <ChevronRight className="w-6 h-6 ml-2" />
          </span>
        </motion.button>

        {/* old button */}
        {/* <Button>SHADCN Button</Button> */}
      </main>
    </div>
  );
}
