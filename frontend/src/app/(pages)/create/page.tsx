"use client";

import React, { useState, useEffect, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Wand2 } from "lucide-react"; // Import the magic wand icon
import { useSession } from "next-auth/react";

const CreatePlaylist = () => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState(null); //store the playlist description
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const {data: session, status} = useSession();
    
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);

  const [spotifyIdFromSession, setSpotifyIdFromSession] = useState<string | undefined>(undefined);


  useEffect(() => {
      console.log("Session Status:", session);
      console.log("Session:", session);

      if (status === "loading") return;
      
      if (status === "authenticated" && session?.accessToken && session?.user) {
        console.log("Authenticated");
        console.log("Access Token:", session.accessToken);
        console.log("Spotify Id:", session.spotifyId);
        console.log("Session:", session)

      //send access token to backend
    const sendAccessToken = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/spotify/access_token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: session.accessToken }),
        });
        if (response.ok) {
          console.log("Access token sent to backend successfully");
        } else {
          console.error("Failed to send access token to backend");
        }
      } catch (error) {
        console.error("Error sending access token:", error);
      }
    };
    sendAccessToken();

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
  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    setShowHistory(false); //hide prompt history after selection
  };

  //handles request for playlist generation
  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    setIsGenerating(true);
    try {
      //get playlist description from Gemini
      const response = await fetch("http://localhost:5000/create_recs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, spotify_id: session?.spotifyId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate playlist. Please try again later.");
      }

      const data = await response.json();
      console.log("Backend response:", data);

      setPlaylistDescription(`Seeds:\n${JSON.stringify(data.seeds, null, 2)}\n\n` +
                               `Gemini Response:\n${data.gemini_response}\n\n` +
                               `Track Spotify IDs:\n${JSON.stringify(data.track_spotify_ids, null, 2)}\n\n` +
                               `Artist Spotify IDs:\n${JSON.stringify(data.artist_spotify_ids, null, 2)}\n\n` +
                               `Recommendations:\n${JSON.stringify(data.recommendations, null, 2)}`);

      // Store prompt in database
      if (session?.spotifyId) {
        await fetch("http://localhost:5000/create_prompt", {
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
    } catch (error: unknown) {
      let message = '';
      if (error instanceof Error){
        message = error.message;
      }
      else{
        message = String(error);
      }
      console.error("API Error:", error);
      setError(message); //display error
      //router.push("/error"); // redirect to error page
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
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
