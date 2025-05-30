"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Bookmark, PlayCircle } from "lucide-react";
import { BsSpotify } from "react-icons/bs"; 
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";


interface Playlist {
  name: string;
  songs: Song[];
  external_urls: { spotify: string };
}

interface Song {
  title: string;
  artist: string;
  albumArt: string;
  duration: string;
  spotifyUrl: string;
}

interface SpotifyTrack {
  name: string;
  duration_ms: number;
  external_urls: {spotify: string};
  artists: {name: string}[];
  album: {images: {url:string}[]};
}

const formatDuration = (ms: number) => { //convert from ms
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, "0")}`;
};

function PlaylistContent() {
  const { data: session, status } = useSession();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const searchParams = useSearchParams();
  const playlistId = searchParams.get("playlistId");

  useEffect(() => {
    console.log("Session Status:", status);
    console.log("Access Token:", session?.accessToken ? "Available" : "Not Available");
    console.log("Playlist ID from URL:", playlistId);

    if (status === "authenticated" && session?.accessToken) {
      console.log("Fetching playlist data...");
      const fetchPlaylistData = async () => {
        try {
          let playlistDetails;

          if (playlistId) {
            console.log(`Workspaceing playlist details for ID: ${playlistId}`);
            const playlistResponse = await fetch(
              `/api/spotify/getPlaylist?accessToken=${session.accessToken}&playlistID=${playlistId}`
            );

            if (!playlistResponse.ok) {
              console.error(
                "Error fetching playlist details:",
                playlistResponse.status,
                await playlistResponse.text()
              );
              return;
            }
            playlistDetails = await playlistResponse.json();
            console.log("Playlist details:", playlistDetails);
          } else {
            console.log("Fetching user playlists to get the most recent...");
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
            console.log("User playlists data:", userPlaylistsData);

            if (userPlaylistsData && userPlaylistsData.length > 0) {
              playlistDetails = userPlaylistsData[0];
              console.log("Most recent playlist details:", playlistDetails);
            } else {
              console.log("No playlists found for the user.");
              setPlaylist(null); //handle no playlist found
              return;
            }
          }

          if (playlistDetails) {
            console.log("Fetching all playlist tracks...");
            const playlistTracksResponse = await fetch(
              `/api/spotify/getPlaylistTracks?accessToken=${session.accessToken}&playlistID=${playlistDetails.id}&limit=100`
            );

            if (!playlistTracksResponse.ok) {
              console.error(
                "Error fetching playlist tracks:",
                playlistTracksResponse.status,
                await playlistTracksResponse.text()
              );
              return;
            }

            console.log("Playlist tracks response OK");
            const playlistTracksData = await playlistTracksResponse.json();
            console.log("Playlist tracks data:", playlistTracksData);

            const songs = playlistTracksData.map((item: SpotifyTrack) => ({
              title: item.name,
              artist: item.artists.map((artist) => artist.name).join(", "),
              albumArt: item.album.images[0]?.url || "/placeholder.jpg",
              duration: formatDuration(item.duration_ms),
              spotifyUrl: item.external_urls.spotify,
            }));

            console.log("Processed songs:", songs);
            setPlaylist({
              name: playlistDetails.name,
              songs: songs,
              external_urls: {
                spotify: playlistDetails.external_urls.spotify
              }
            });
            console.log("Playlist state updated:", {
              name: playlistDetails.name,
              songs: songs,
            });
          }
        } catch (error) {
          console.error("Error fetching playlist data:", error);
        }
      };

      fetchPlaylistData();
    }
  }, [session?.accessToken, status, playlistId]);

  if (!playlist) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading playlist...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-6 sm:px-16 pt-32 font-[family-name:var(--font-geist-sans)] pb-20">
      {/* header playlist title */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        <a 
          href={playlist.external_urls.spotify}
          target="_blank" // opens to new tab
          rel="noopener noreferrer" // for good security practice after using _blank
          className="px-4 py-2 flex items-center gap-2 bg-gray-300 text-black border border-black rounded-full hover:bg-gray-400 transition
          dark:bg-black dark:text-white dark:hover:bg-gray-900"
          >
          <BsSpotify className="w-5 h-5"/> View on Spotify
        </a>
      </div>

      {/* songs */}
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {playlist.songs.map((song, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center p-4 bg-white/30 text-black rounded-2xl shadow-md border border-gray-900/20 dark:bg-black/30 dark:border-white/10 dark:text-white" // Updated background and border
          >
            {/* album/single art */}
            <div className="w-16 h-16 bg-gray-700 rounded-lg flex-shrink-0 dark:bg-gray-300">
              <img
                src={song.albumArt}
                alt={song.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* song details */}
            <div className="ml-4 flex-1 flex flex-col">
              <span className="font-semibold">{song.title}</span>
              <span className="text-gray-800 text-sm dark:text-gray-100">{song.artist}</span>
            </div>

            {/* song duration */}
            <span className="text-gray-700 text-sm mr-4 dark:text-gray-200">{song.duration}</span>

            {/* play button */}
            <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer" className="ml-auto">
              <PlayCircle className="w-8 h-8 text-gray-800 hover:text-white dark:text-gray-100 dark:hover:text-black transition" />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const PlaylistView = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <PlaylistContent />
    </Suspense>
  );
};

export default PlaylistView;
