"use client";

import React, { useState, useEffect, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Wand2 } from "lucide-react"; // Import the magic wand icon
import { useSession } from "next-auth/react";

import { ChevronRight } from "lucide-react";

const CreatePlaylist = () => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState<string |null>(null); //store the playlist description
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const {data: session, status} = useSession();
    
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);

  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [spotifyIdFromSession, setSpotifyIdFromSession] = useState<string | undefined>(undefined);
  const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  useEffect(() => {
      if (status === "loading") return;
      
      if (status === "authenticated" && session?.accessToken && session?.user) {
        console.log("Authenticated");
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

  // Previous prompts
  useEffect(() => {
    if (status === "authenticated" && session?.spotifyId) {
      const fetchPromptHistory = async () => {
        const response = await fetch(`${BACKEND_API_URL}/get_prompts_by_spotify_id/${session.spotifyId}`);
        if (response.ok) {
          const prompts = await response.json();
          // Get the mood from the most recent prompts (up to 3)
          const recentPrompts = prompts
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
            .map((prompt: any) => prompt.mood);
          setPromptHistory(recentPrompts);
        }
      };
      fetchPromptHistory();
    }
  }, [session, status, BACKEND_API_URL]);


  //handles selection from prompt history
  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    setShowHistory(false); //hide prompt history after selection
  };


  /*
  // Handler for creating playlist test
  const handleCreatePlaylist = async () => {
    if (!session || !session.accessToken){
      setError("No access token found");
      return;
    }
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/spotify/create_playlist_test?access_token=${session.accessToken}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create playlist"); 
      }
      const data = await response.json();
      console.log("Playlist created: ", data);

    } catch (error: any) {
      setError(`Error creating playlist ${error.message}`);
    }
  }
    */
    


  //handles request for playlist generation
  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    setIsGenerating(true);
    try {
      //get playlist description from Gemini
      const response = await fetch(`${BACKEND_API_URL}/create_recs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, spotify_id: session?.spotifyId, access_token: session?.accessToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate playlist. Please try again later.");
      }

      const data = await response.json();
      console.log("Backend response:", data);


      // Store prompt in database
      /*
      if (session?.spotifyId) {
        await fetch(`${BACKEND_API_URL}/create_prompt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spotify_id: session.spotifyId,
            mood: input,
            additional_notes: null
          }),
        });
      }
      */

      setPlaylistDescription(null);
      setError(null);
      // router push
      router.push(`/playlists?playlistId=${data.playlist_id}`);
      
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
      setShowHistory(false);
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
            className="w-full p-4 pr-12 glass-card text-black placeholder-gray-600 focus:outline-none
            dark:text-white dark:placeholder-gray-400"
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
            <Wand2 className="w-5 h-5 text-gray-700 dark:text-gray-100" />
          </button>

          {/* Prompt history popup */}
          {showHistory && promptHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card absolute left-0 top-full mt-2 w-full z-10"
            >
              <p className="text-gray-700 text-sm mb-2 px-4 pt-4 dark:text-gray-400">Previous prompts:</p>
              {promptHistory.map((prompt, index) => (
                <p
                  key={index}
                  className="p-4 hover:bg-white/50 transition-colors cursor-pointer text-sm text-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
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

      {/* Create Playlist button for testing
      <motion.button
        onClick={() => handleCreatePlaylist()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="btn"
      >
        <span className="flex items-center justify-center">
          CREATE MY CUSTOM PLAYLIST
          <ChevronRight className="w-6 h-6 ml-2" />
        </span>
      </motion.button>
      
      */}
      
  

    </div>
  );
};

export default CreatePlaylist;
