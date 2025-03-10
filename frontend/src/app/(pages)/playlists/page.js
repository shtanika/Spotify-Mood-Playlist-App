"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, PlayCircle } from "lucide-react";

const PlaylistView = () => {
  // PLACEHOLDER DATA
  const [playlist, setPlaylist] = useState({
    name: "Chill Vibes Mix",
    songs: [
	{ title: "Song One", artist: "Artist A", albumArt: "/placeholder.jpg" },
	{ title: "Song Two", artist: "Artist B", albumArt: "/placeholder.jpg" },
	{ title: "Song Three", artist: "Artist C", albumArt: "/placeholder.jpg" },
	{ title: "Song Four", artist: "Artist D", albumArt: "/placeholder.jpg" },
	{ title: "Song Five", artist: "Artist E", albumArt: "/placeholder.jpg" },
	{ title: "Song Six", artist: "Artist F", albumArt: "/placeholder.jpg" },
	//{ title: "Song Seven", artist: "Artist G", albumArt: "/placeholder.jpg" },
	//{ title: "Song Eight", artist: "Artist H", albumArt: "/placeholder.jpg" },
    ],
  });

  return (
    <div className="flex flex-col items-center min-h-screen px-6 sm:px-16 pt-32 font-[family-name:var(--font-geist-sans)]">
      
      {/* header playlist title */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        <button className="px-4 py-2 flex items-center gap-2 bg-gray-300 text-black border border-black rounded-full hover:bg-gray-400 transition">
          <Bookmark className="w-5 h-5" /> Save to Library
        </button>
      </div>

      {/* songs */}
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {playlist.songs.map((song, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center p-4 bg-black text-white rounded-2xl shadow-md border border-gray-700"
          >
            {/* album/single art */}
            <div className="w-16 h-16 bg-gray-700 rounded-lg flex-shrink-0">
              {/* placeholder imgs */}
              <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover rounded-lg" />
            </div>

            {/* song details */}
            <div className="ml-4 flex flex-col">
              <span className="font-semibold">{song.title}</span>
              <span className="text-gray-400 text-sm">{song.artist}</span>
            </div>

            {/* play button ??? placeholder */}
            <button className="ml-auto">
              <PlayCircle className="w-8 h-8 text-gray-400 hover:text-white transition" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistView;
