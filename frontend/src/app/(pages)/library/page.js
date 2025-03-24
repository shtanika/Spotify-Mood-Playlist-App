"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function Library() {
  const { data: session, status } = useSession();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      const fetchPlaylists = async () => {
        try {
          const response = await fetch(`/api/spotify/getUserPlaylists?accessToken=${session.accessToken}`);
          const data = await response.json();
          console.log("Fetched Playlists: ", data);
          setPlaylists(data);
        } catch (error) {
          console.error("Error fetching playlists:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchPlaylists();
    }
  }, [session?.accessToken, status]);

  return (
    <div className="min-h-screen px-8 sm:px-16 pt-28 pb-16 text-white">
      <h1 className="text-4xl font-bold mb-8">Your Library</h1>

      {loading ? (
        <p className="text-gray-400">Loading your playlists...</p>
      ) : playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 rounded-3xl shadow-md border bg-opacity-80 bg-black flex items-start justify-between"
            >
              <div className="flex-1">
                <h2 className="text-lg font-semibold leading-6 mb-2">{playlist.name}</h2>
                <p className="text-gray-400 text-sm">
                  {playlist.tracks.total} {playlist.tracks.total === 1 ? "song" : "songs"}
                </p>
                <Link
                  href={`/playlist-view/${playlist.id}`}
                  className="text-blue-400 text-sm hover:underline flex items-center mt-2"
                >
                  View Playlist <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {playlist.images?.length > 0 ? (
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-700 rounded-lg" /> //placeholder img
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No playlists found. Try creating one!</p>
      )}
    </div>
  );
}
