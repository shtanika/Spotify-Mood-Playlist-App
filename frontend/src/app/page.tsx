"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="py-20 flex items-center justify-center min-h-screen">
      <main className="glass-container py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-8xl font-bold text-center glass-title mb-4"
        >
          PLAYLISTS<br />
          BASED ON<br />
          YOUR MOOD
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg sm:text-2xl text-center glass-subtitle mb-6"
        >
          Discover playlists crafted to match your current vibe and musical taste.
        </motion.p>

        <button onClick={handleClick} className="btn mt-2">
          <span className="flex items-center justify-center relative z-10">
            CREATE MY CUSTOM PLAYLIST
            <ChevronRight className="w-6 h-6 ml-2" />
          </span>
        </button>
      </main>
    </div>
  );
}
