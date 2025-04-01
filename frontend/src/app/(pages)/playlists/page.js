"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bookmark, PlayCircle } from "lucide-react";
import { useSession } from "next-auth/react";

const PlaylistView = () => {
  const { data: session, status } = useSession();
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      const fetchPlaylistData = async () => {
        try {
          const userPlaylistsResponse = await fetch(
            `/api/spotify/getUserPlaylists?accessToken=${session.accessToken}`
          );

          if (!userPlaylistsResponse.ok) {
            console.error(
              "Error fetching user playlists:",
              userPlaylistsResponse.status,
              await userPlaylistsResponse.text()
            );
            return;
          }

          const userPlaylistsData = await userPlaylistsResponse.json();

          if (userPlaylistsData.items && userPlaylistsData.items.length > 0) {
            const mostRecentPlaylist = userPlaylistsData.items[0];
            const playlistTracksResponse = await fetch(
              `/api/spotify/getPlaylistTracks?accessToken=${session.accessToken}&playlistId=${mostRecentPlaylist.id}`
            );

            if (!playlistTracksResponse.ok) {
              console.error(
                "Error fetching playlist tracks:",
                playlistTracksResponse.status,
                await playlistTracksResponse.text()
              );
              return;
            }

            const playlistTracksData = await playlistTracksResponse.json();

            const songs = playlistTracksData.items.map((item) => ({
              title: item.track.name,
              artist: item.track.artists.map((artist) => artist.name).join(", "),
              albumArt: item.track.album.images[0]?.url || "/placeholder.jpg",
            }));

            setPlaylist({
              name: mostRecentPlaylist.name,
              songs: songs,
            });
          }
        } catch (error) {
          console.error("Error fetching playlist data:", error);
        }
      };

      fetchPlaylistData();
    }
  }, [session?.accessToken, status]);

  if (!playlist) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading playlist...
      </div>
    );
  }

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
              <img
                src={song.albumArt}
                alt={song.title}
                className="w-full h-full object-cover rounded-lg"
              />
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
