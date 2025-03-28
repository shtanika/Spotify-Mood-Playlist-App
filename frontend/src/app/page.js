"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function Home() {

    const { data: session } = useSession(); //get authentication state
    const router = useRouter();

  const handleClick = () => {
    if (session) {
      router.push("/create"); //redirect if signed in
    } else {
      signIn("spotify"); //otherwise trigger sign-in
    }
  };

    
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

      { /* redirect or sign in */}
        <button onClick={handleClick} className="btn">
	  
          <span className="flex items-center justify-center relative z-10">
            CREATE MY CUSTOM PLAYLIST
            <ChevronRight className="w-6 h-6 ml-2" />
          </span>
	  
        </button>

      </main>
    </div>
  );
}
