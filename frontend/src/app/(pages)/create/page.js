"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Wand2 } from "lucide-react"; // Import the magic wand icon
import { useSession } from "next-auth/react";

const CreatePlaylist = () => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState(null); //store the playlist description
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const {data: session, status} = useSession();
    
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);


  useEffect(() => {
      console.log("Session Status:", session);
      console.log("Session:", session);
      if (status === "loading") return;
      
      if (status === "authenticated" && session.accessToken) {
	  
        console.log("Authenticated");
        console.log("Access Token:", session.accessToken);
        console.log("Spotify Id:", session.spotifyId);

	const fetchSpotifyData = async () => {
        try {
          const [tracksResponse, artistsResponse] = await Promise.all([
            fetch(`/api/spotify/topTracks?accessToken=${session.accessToken}`),
            fetch(`/api/spotify/topArtists?accessToken=${session.accessToken}`)
          ]);
          const topTracksData = await tracksResponse.json();
          const topArtistsData = await artistsResponse.json();
          setTopTracks(topTracksData?.items || []);
          setTopArtists(topArtistsData?.items || []);
        } catch (error) {
          console.error("Error fetching Spotify data:", error);
        }
      };
      fetchSpotifyData();
	  
      }
  }, [session, status]);

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
      // Get playlist description from Gemini
      const response = await fetch("/create_recs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: input,
          topTracks: topTracks,
          topArtists: topArtists,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate playlist. Please try again later.");
      }

      const data = await response.json();
	
      setPlaylistDescription(`Seeds:\n${JSON.stringify(data.seeds, null, 2)}\n\n Gemini Description:\n${data.description}`);

      // Store prompt in database
      if (session?.spotifyId) {
        await fetch('/api/backend/prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spotify_id: session.spotifyId,
            mood: input,
            additional_notes: null
          }),
        });
      }

      setError(null);
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
      e.preventDefault(); // Prevent default form submission behavior
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
            onKeyDown={handleKeyPress}
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
            className="glass-card mt-8 p-6 text-left whitespace-pre-wrap font-mono text-sm"
          >
            {playlistDescription}
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
