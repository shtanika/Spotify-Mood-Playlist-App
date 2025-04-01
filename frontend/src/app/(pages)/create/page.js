"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react"; // Import the magic wand icon

const CreatePlaylist = () => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState(null); //store the playlist description
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  //examples of previous prompts (static for now)
  const promptHistory = [
    "Chill sunset vibes",
    "Energizing workout mix",
    "Mellow and nostalgic",
  ];

  //handles selection from prompt history
  const handlePromptClick = (prompt) => {
    setInput(prompt);
    setShowHistory(false); //hide prompt history after selection
  };

  //handles request for playlist generation
  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate playlist. Please try again later.");
      }

      const data = await response.json();
      setPlaylistDescription(data.playlistDescription); //store the playlist description
      setError(null); //clear previous errors
    } catch (error) {
      console.error("API Error:", error);
      setError(error.message); //display error
      //router.push("/error"); // redirect to error page
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-8 sm:p-20">
      {/* Main container with glass effect */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="glass-container w-full max-w-2xl"
      >
        {/* Title */}
        <h1 className="glass-title text-3xl sm:text-4xl mb-12">
          What mood would you like your playlist to reflect?
        </h1>

        {/* Input box with integrated generate button */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Upbeat but sad..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            className="w-full p-4 pr-12 glass-card text-black placeholder-gray-600 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={isGenerating || !input.trim()}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full 
              transition-all duration-300 ${
                isGenerating ? 'animate-spin' : 'hover:bg-white/50'
              } ${
                !input.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
          >
            <Wand2 className="w-5 h-5 text-gray-700" />
          </button>

          {/* Prompt history popup */}
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card absolute left-0 top-full mt-2 w-full z-10"
            >
              <p className="text-gray-700 text-sm mb-2 px-4 pt-4">Previous prompts:</p>
              {promptHistory.map((prompt, index) => (
                <p
                  key={index}
                  className="p-4 hover:bg-white/50 transition-colors cursor-pointer text-sm text-gray-800"
                  onClick={() => handlePromptClick(prompt)}
                >
                  {prompt}
                </p>
              ))}
            </motion.div>
          )}
        </div>

        {/* Playlist Description Display */}
        {playlistDescription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card mt-8 p-6 text-center"
          >
            <p className="text-gray-800">{playlistDescription}</p>
          </motion.div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 glass-card bg-red-500/50 text-white p-6 text-center"
          >
            <strong>Error:</strong> {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CreatePlaylist;
