"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const CreatePlaylist = () => {
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  //example previous prompts
  const promptHistory = [
    "Chill sunset vibes",
    "Energizing workout mix",
    "Mellow and nostalgic",
  ];

  const handlePromptClick = (prompt) => {
    setInput(prompt);
    setShowHistory(false); //hide prompt history
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-xl sm:text-2xl text-center"
      >
        What mood would you like your playlist to reflect?
      </motion.h1>

      {/* Input box */}
      <div className="relative w-full max-w-2xl">
        <input
          type="text"
          placeholder="Upbeat but sad..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setShowHistory(true)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)} //delayed hiding
          className="w-full p-4 text-white bg-black rounded-3xl placeholder-gray-500 border border-gray-700 focus:outline-none"
        />

        {/* Prompt history popup */}
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 top-full mt-2 w-full bg-gray-800 text-white rounded-xl shadow-lg p-4"
          >
            <p className="text-gray-400 text-sm mb-2">Previous prompts:</p>
            {promptHistory.map((prompt, index) => (
              <p 
                key={index} 
                className="p-2 hover:bg-gray-700 rounded cursor-pointer text-sm"
                onClick={() => handlePromptClick(prompt)} //handles clicks
              >
                {prompt}
              </p>
            ))}
          </motion.div>
        )}
      </div>

      {/* buttons */}
      <div className="flex gap-4">
        {/* Generate button */}
        <button className="px-6 py-3 border border-black text-black bg-gray-300 rounded-full hover:bg-gray-400 transition">
          Generate
        </button>
      </div>
    </div>
  );
};

export default CreatePlaylist;
