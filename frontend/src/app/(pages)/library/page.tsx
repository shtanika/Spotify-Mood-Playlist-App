"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface Playlist {
  id: string;
  name: string;
  images: {url: string}[];
  tracks: {total: number};
}

export default function Library() {
  const { data: session, status } = useSession();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
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
    <div className="flex flex-col items-center min-h-screen p-8 pb-20 gap-8 sm:p-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="glass-container w-full max-w-5xl"
      >
        <h1 className="glass-title text-3xl sm:text-4xl mb-8">Your Library</h1>

        {loading ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600 text-center p-8 dark:text-gray-100"
          >
            Loading your playlists...
          </motion.p>
        ) : playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 flex items-start justify-between hover:bg-white/10 transition-colors"
              >
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-black mb-2 dark:text-white">
                    {playlist.name}
                  </h2>
                  <p className="text-gray-600 text-sm dark:text-gray-100">
                    {playlist.tracks.total} {playlist.tracks.total === 1 ? "song" : "songs"}
                  </p>
                  <Link
		href={`/playlists?playlistId=${playlist.id}`}
		className="text-blue-500 text-sm hover:underline flex items-center mt-2 group"
		    >
		    View Playlist
		    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
		    </Link>
                </div>

                {playlist.images?.length > 0 ? (
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    className="w-24 h-24 rounded-lg object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg shadow-lg" />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-8 text-center"
          >
            <p className="text-gray-600">No playlists found. Try creating one!</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
