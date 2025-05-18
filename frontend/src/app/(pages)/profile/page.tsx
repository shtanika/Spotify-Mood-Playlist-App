"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";

interface UserData {
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  }
  images: {url: string}[];
}


interface Playlist {
  id: string;
  name: string;
  images: {url: string}[];
  tracks: {total: number};
}

interface TopTrack {
  id: string;
  name: string;
  artists: {name: string}[];
  album: {
    name: string;
    images: {url: string};
  };
}

interface TopArtist {
  id: string;
  name: string;
  images: { url: string }[];
}

const Profile = () => {
  // placeholder user data REPLACE LATER
  const {data: session, status} = useSession();
  const { theme, setTheme } = useTheme();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [topTracksData, setTopTracksData] = useState<TopTrack[] | null>(null);
  const [topArtistsData, setTopArtistsData] = useState<TopArtist[] | null>(null);
  const [savedTracksData, setSavedTracksData] = useState(null);
  const [userPlaylistsData, setUserPlaylistData] = useState<Playlist[] | null>(null);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [userBackendData, setUserBackendData] = useState<UserData | null>(null);
  const [username, setUsername] = useState("");
  const [usernameUpdateSuccess, setUsernameUpdateSuccess] = useState(false);
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [userSince, setUserSince] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [explicitFilter, setExplicitFilter] = useState(false);

  // Initialize darkMode state based on theme
  useEffect(() => {
    setDarkMode(theme === "dark");
  }, [theme]);

  // Update theme when darkMode changes
  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    setTheme(checked ? "dark" : "light");
  };

  const formatUserSince = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") {
      console.log("Authenticated");
      console.log("Spotify Id:", session.spotifyId);      
    }
    if(session?.accessToken){
      const fetchUserData = async () => {
        try {
          
          //const response = await fetch(`/api/spotify/userData?accessToken=${session.accessToken}`);
          const [userResponse, tracksResponse, artistsResponse, savedTracksResponse, userPlaylistsResponse] = await Promise.all([
            fetch(`/api/spotify/userData?accessToken=${session.accessToken}`),
            fetch(`/api/spotify/topTracks?accessToken=${session.accessToken}`),
            fetch(`/api/spotify/topArtists?accessToken=${session.accessToken}`),
            fetch(`/api/spotify/savedTracks?accessToken=${session.accessToken}?limit=4`),
            fetch(`/api/spotify/getUserPlaylists?accessToken=${session.accessToken}`)
          ]);
          console.log("API response statuses: ", userResponse.status, tracksResponse.status, artistsResponse.status);
          const userData = await userResponse.json();
          console.log("User Data: ", userData);
          const topTracksData = await tracksResponse.json();
          console.log("Top Tracks Data: ", topTracksData);
          const topArtistsData = await artistsResponse.json();
          console.log("Top Artists Data: ", topArtistsData);
          const savedTracksData = await savedTracksResponse.json();
          console.log("Saved Tracks Data: ", savedTracksData);
          const userPlaylistsData = await userPlaylistsResponse.json();
          console.log("User Playlists Data: ", userPlaylistsData);

          // check for explicit filter
          if(userData.explicit_content?.filter_enabled === false){
            setExplicitFilter(true);
          } else{
            setExplicitFilter(false);
          }
          setUserData(userData);
          //setUsername(userData.display_name);
          //setEmail(userData.email);
          setTopTracksData(topTracksData);
          setTopArtistsData(topArtistsData);
          setSavedTracksData(savedTracksData);
          setUserPlaylistData(userPlaylistsData);

          const userBackendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/get_user/${session.spotifyId}`);
          const userBackendData = await userBackendResponse.json();
          setUserBackendData(userBackendData);
          console.log("User Backend Data: ", userBackendData);
          setEmail(userBackendData.email);
          setUsername(userBackendData.display_name);
          setUserSince(userBackendData.created_at);

        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      };
      fetchUserData();
    } else {
      console.log("Not authenticated");
    }
  }, [session?.accessToken, status]);

    const boxStyle = darkMode
	  ? "bg-black text-white border-gray-700"
	  : "bg-white text-black border-gray-300";

    
  const handleUsernameUpdate = async () => {
    setIsUpdatingUsername(true);
    setUpdateError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/change_username/${session?.spotifyId}?display_name=${encodeURIComponent(username)}`, {
        method: 'PUT'
      });
      if (!response.ok) {
        throw new Error(`Failed to update username: ${response.statusText}`);
      }
      const updatedUser = await response.json();
      console.log("Updated User: ", updatedUser);
      setIsUpdatingUsername(false);
      setUsernameUpdateSuccess(true);
      setTimeout(() => {
        setUsernameUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating username: ", error);
      setUpdateError("Failed to update username");
      setIsUpdatingUsername(false);
    }
  };

  const handleEmailUpdate = async () => {
    setIsUpdatingEmail(true);
    setUpdateError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/change_email/${session?.spotifyId}?email=${encodeURIComponent(email)}`, {
        method: 'PUT'
      });
      if (!response.ok) {
        throw new Error(`Failed to update email: ${response.statusText}`);
      }
      const updatedUser = await response.json();
      console.log("Updated User: ", updatedUser);
      setIsUpdatingEmail(false);
      setEmailUpdateSuccess(true);
      setTimeout(() => {
        setEmailUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating email: ", error);
      setUpdateError("Failed to update email");
      setIsUpdatingEmail(false);
    }
  };

  const handleChangeAccount = async () => {
    try {
      await signOut({ redirect: false });
      window.location.href = `/api/auth/signin/spotify?callbackUrl=${encodeURIComponent(
        window.location.origin + '/profile'
      )}&prompt=select_account`;
    } catch (error) {
      console.error("Error changing account:", error);
      setUpdateError("Failed to change account. Please try again.");
    }
  };

  return (

	<div className="flex flex-col sm:flex-row min-h-screen px-8 sm:px-20 pt-22 gap-16 sm:gap-45 font-[family-name:var(--font-geist-sans)] max-w-7xl mx-auto">
      
      {/* LEFT SIDE: PROFILE SETTINGS */}
      <div className="flex-[2] flex flex-col gap-8">
        
        <div className="flex items-center gap-6">
          {/* profile pic */}
          <img 
            src={userData?.images[0]?.url || undefined}
            alt="Profile Picture"
            className="w-25 h-25 object-cover rounded-full"
          />

          {/* username and join date */}
          <div>
            <h1 className="text-2xl font-bold">{userBackendData?.display_name}</h1>
            <p className="text-gray-800 text-sm dark:text-gray-100">User since {userSince ? formatUserSince(userSince) : "Loading..."}</p>
          </div>
        </div>

        {/* PROFILE SETTINGS */}
        <div className="flex flex-col gap-6">
          
          {/* change username */}
          <div className="glass-card p-4 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Change Username</h2>
            <div className="flex items-center gap-2">
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 p-2 rounded-lg border focus:outline-none bg-white/50 backdrop-blur-sm"
                placeholder="Enter new username"
              />
              <button 
                onClick={handleUsernameUpdate}
                disabled={isUpdatingUsername || !username.trim() || username === userBackendData?.display_name}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-white ${
                  isUpdatingUsername || !username.trim() || username === userBackendData?.display_name
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isUpdatingUsername ? "Updating..." : "Update"}
              </button>
            </div>
            {usernameUpdateSuccess && (
              <p className="text-green-500">Username updated successfully!</p>
            )}
            {updateError && (
              <p className="text-red-500">Error: {updateError}</p>
            )}
          </div>

          {/* change email */}
          <div className="glass-card p-4 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Change Email</h2>
            <div className="flex items-center gap-2">
              <input 
                type="email"
                value={email || "Loading. . ."}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 p-2 rounded-lg border focus:outline-none bg-white/50 backdrop-blur-sm"
                placeholder="Enter new email"
              />
              <button 
                onClick={handleEmailUpdate}
                disabled={isUpdatingEmail || !email.trim() || email === userBackendData?.email}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-white ${
                  isUpdatingEmail || !email.trim() || email === userBackendData?.email
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isUpdatingEmail ? "Updating..." : "Update"}
              </button>
            </div>
            {emailUpdateSuccess && (
              <p className="text-green-500">Email updated successfully!</p>
            )}
            {updateError && (
              <p className="text-red-500">Error: {updateError}</p>
            )}
          </div>

          {/* change spotify account */}
          <div className="glass-card p-4 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Spotify Account</h2>
            <div className="flex justify-between items-center">
              <span className="text-sm">Connected</span>
              <button 
                onClick={handleChangeAccount}
                className="text-blue-400 text-sm hover:underline">
                Change Account
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="glass-card p-4 rounded-2xl shadow-lg flex justify-between items-center">
            <span>Dark Mode</span>
            <Switch 
              checked={darkMode} 
              onCheckedChange={handleDarkModeChange} 
              className={`transition-colors ${darkMode ? "bg-blue-500 shadow-blue-500/50 shadow-md" : "bg-gray-600"}`}
              style={{ boxShadow: darkMode ? '0 0 10px 5px rgba(40, 100, 250, 0.6)' : 'none' }}
            />
          </div>

          <div className="glass-card p-4 rounded-2xl shadow-lg flex justify-between items-center">
            <span>Enable Notifications</span>
            <Switch 
              checked={notifications} 
              onCheckedChange={setNotifications} 
              className={`transition-colors ${darkMode ? "bg-blue-500 shadow-blue-500/50 shadow-md" : "bg-gray-600"}`}
              style={{ boxShadow: notifications ? '0 0 10px 5px rgba(40, 100, 250, 0.6)' : 'none' }}
            />
          </div>

          <div className="glass-card p-4 rounded-2xl shadow-lg flex justify-between items-center">
            <span>Explicit Content Filter</span>
            <Switch 
              checked={explicitFilter} 
              onCheckedChange={setExplicitFilter} 
              className={`transition-colors ${darkMode ? "bg-blue-500 shadow-blue-500/50 shadow-md" : "bg-gray-600"}`}
              style={{ boxShadow: explicitFilter ? '0 0 10px 5px rgba(40, 100, 250, 0.6)' : 'none' }}
            />
          </div>
          
        </div>
      </div>

      {/* RIGHT SIDE: PREVIEWS?? */}
      <div className="flex-[1] flex flex-col gap-8 pt-6">
        
        {/* recent playlist */}
	  <motion.div
	      initial={{ opacity: 0, y: 10 }}
	      animate={{ opacity: 1, y: 0 }}
	      transition={{ duration: 0.5 }}
	      className="glass-card p-6 rounded-3xl shadow-lg flex items-start justify-between"
	  >
	      <div className="flex-1">
		  <h2 className="text-lg font-semibold leading-6 mb-2">
		      Your Most <br />
		      Recent Playlist
		  </h2>
		  <p className="text-gray-400 text-sm">
		      {userPlaylistsData ? userPlaylistsData[0]?.name : "Loading. . ."}
		  </p>
		  <Link
		      href="/playlist-view"
		      className="text-blue-400 text-sm hover:underline flex items-center mt-2"
		  >
		      View Playlist <ChevronRight className="w-4 h-4 ml-1" />
		  </Link>
	      </div>
	      {userPlaylistsData &&
	       userPlaylistsData[0]?.images &&
	       userPlaylistsData[0].images.length > 0 && (
		   <img
		       src={userPlaylistsData[0].images[0].url}
		       alt="Most Recent Playlist"
		       className="w-20 h-20 rounded-xl object-cover"
		   />
	       )}
	  </motion.div>

        {/* Library */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 rounded-3xl shadow-lg"
        >
          <h2 className="text-lg font-semibold mb-2">Your Library</h2>
          <div className="flex gap-2">
            {userPlaylistsData &&
              userPlaylistsData.slice(0, 4).map((playlist, index) => (
                <div key={index} className="w-20 h-20 overflow-hidden relative">
                  {playlist.images && playlist.images.length > 0 ? (
                    <img
                      src={playlist.images[0].url}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700" />
                  )}
                </div>
              ))}
          </div>
          <Link
            href="/library"
            className="text-blue-400 text-sm hover:underline flex items-center mt-2"
          >
            Open Library <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </motion.div>


        {/* user stats?? */}
	  <motion.div
	      initial={{ opacity: 0, y: 10 }}
	      animate={{ opacity: 1, y: 0 }}
	      transition={{ duration: 0.6 }}
	      className="glass-card p-6 rounded-3xl shadow-lg flex justify-between items-center"
	  >
	      <div>
		  <h2 className="text-lg font-semibold mb-2">Your Listening Stats</h2>
		  <p className="text-gray-400 text-sm">
		      <strong>Top Genre:</strong> Lo-Fi
		  </p>
		  {topArtistsData && topArtistsData.length > 0 ? (
		      <p className="text-gray-400 text-sm">
			  <strong>Top Artist:</strong> {topArtistsData[0]?.name || "Unknown Artist"}
		      </p>
		  ) : (
		      <p className="text-gray-400 text-sm">
			  <strong>Top Artist:</strong> No artist found
		      </p>
		  )}
		  {topTracksData && topTracksData.length > 0 ? (
		      <p className="text-gray-400 text-sm">
			  <strong>Top Song:</strong> {topTracksData[0]?.name || "Unknown Song"}
		      </p>
		  ) : (
		      <p className="text-gray-400 text-sm">
			  <strong>Top Song:</strong> Loading...
		      </p>
		  )}
		  {/*<p className="text-gray-400 text-sm"><strong>Top Artist:</strong> {topArtistsData[0]?.name || "Loading..."}</p>
		     <p className="text-gray-400 text-sm"><strong>Top Song:</strong> {topTracksData[0]?.name || "Loading..."}</p> */}
	      </div>
	      {topArtistsData &&
	       topArtistsData.length > 0 &&
	       topArtistsData[0].images &&
	       topArtistsData[0].images.length > 0 ? (
		   <img
		       src={topArtistsData[0].images[0].url}
		       alt={topArtistsData[0].name}
		       className="w-30 h-30 rounded-lg object-cover mb-3"
		   />
	       ) : (
		   <div className="w-30 h-30 bg-gray-700 rounded-lg mb-3"></div> // placeholder
	       )}
	  </motion.div>
	    
      </div>

    </div>
    
    );
};

export default Profile
