"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { set } from "lodash";





const Profile = () => {

  // placeholder user data REPLACE LATER
  const {data: session, status} = useSession();
  const [userData, setUserData] = useState(null);
  const [topTracksData, setTopTracksData] = useState(null);
  const [topArtistsData, setTopArtistsData] = useState(null);
  const [savedTracksData, setSavedTracksData] = useState(null);


  const [username, setUsername] = useState("User12345");
  const [email, setEmail] = useState("user12345@gmail.com");
  const userSince = "March 2025";
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [explicitFilter, setExplicitFilter] = useState(false);

  useEffect(() => {
	document.body.classList.toggle("bg-white", !darkMode);
	document.body.classList.toggle("bg-black", darkMode);
    }, [darkMode]);

  useEffect(() => {
    console.log("Session Status:", session);
    console.log("Session:", session);
    if (status === "loading") return;
    if (status === "authenticated") {
      console.log("Authenticated");
      console.log("Access Token:", session.accessToken);     
    }
    if(session?.accessToken){
      const fetchUserData = async () => {
        try {
          
          //const response = await fetch(`/api/spotify/userData?accessToken=${session.accessToken}`);
          const [userResponse, tracksResponse, artistsResponse, savedTracksResponse] = await Promise.all([
            fetch(`/api/spotify/userData?accessToken=${session.accessToken}`),
            fetch(`/api/spotify/topTracks?accessToken=${session.accessToken}`),
            fetch(`/api/spotify/topArtists?accessToken=${session.accessToken}`),
            fetch(`/api/spotify/savedTracks?accessToken=${session.accessToken}?limit=4`)
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

          // check for explicit filter
          if(userData.explicit_content?.filter_enabled === false){
            setExplicitFilter(true);
          } else{
            setExplicitFilter(false);
          }
          setUserData(userData);
          setTopTracksData(topTracksData);
          setTopArtistsData(topArtistsData.items);
          setSavedTracksData(savedTracksData);
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
    
    return (

	<div className="flex flex-col sm:flex-row min-h-screen px-8 sm:px-20 pt-32 gap-16 font-[family-name:var(--font-geist-sans)] max-w-7xl mx-auto">
      
      {/* LEFT SIDE: PROFILE SETTINGS */}
      <div className="flex-[1] flex flex-col gap-8">
        
        <div className="flex items-center gap-6">
          {/* profile pic */}
          <img 
            src={userData?.images[0]?.url || null}
            alt="Profile Picture"
            className="w-full h-full object-cover"
          />
          <div className="w-30 h-30 sm:w-28 sm:h-28 rounded-full bg-gray-600" />

          {/* username and join date */}
          <div>
            <h1 className="text-2xl font-bold">{userData? userData.display_name : "Loading. . ."}</h1>
            <p className="text-gray-800 text-sm">User since {userSince}</p>
          </div>
        </div>

        {/* PROFILE SETTINGS */}
        <div className="flex flex-col gap-6">
          
          {/* change username */}
          <div className={`${boxStyle} p-4 rounded-2xl shadow-md border`}>
            <h2 className="text-lg font-semibold mb-2">Change Username</h2>
            <input 
              type="text"
              value={userData? userData.display_name : "Loading. . ."}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full p-2 rounded-lg border focus:outline-none ${darkMode ? "bg-gray-800 text-white border-gray-600" : "bg-gray-100 text-black border-gray-400"}`}
            />
          </div>

          {/* change email */}
          <div className={`${boxStyle} p-4 rounded-2xl shadow-md border`}>
            <h2 className="text-lg font-semibold mb-2">Change Email</h2>
            <input 
              type="email"
              value={userData? userData.email : "Loading. . ."}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 rounded-lg border focus:outline-none ${darkMode ? "bg-gray-800 text-white border-gray-600" : "bg-gray-100 text-black border-gray-400"}`}
            />
          </div>

          {/* change spotify account */}
          <div className={`${boxStyle} p-4 rounded-2xl shadow-md border`}>
            <h2 className="text-lg font-semibold mb-2">Spotify Account</h2>
            <div className="flex justify-between items-center">
              <span className="text-sm">Connected</span>
              <button className="text-blue-400 text-sm hover:underline">
                Change Account
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className={`${boxStyle} p-4 rounded-2xl shadow-md border flex justify-between items-center`}>
            <span>Dark Mode</span>
            <Switch 
              checked={darkMode} 
              onCheckedChange={setDarkMode} 
              className={`transition-colors ${darkMode ? "bg-blue-500 shadow-blue-500/50 shadow-md" : "bg-gray-600"}`}
	      style={{ boxShadow: darkMode ? '0 0 10px 5px rgba(40, 100, 250, 0.6)' : 'none' }}
            />
          </div>

          <div className={`${boxStyle} p-4 rounded-2xl shadow-md border flex justify-between items-center`}>
            <span>Enable Notifications</span>
            <Switch 
              checked={notifications} 
              onCheckedChange={setNotifications} 
              className={`transition-colors ${darkMode ? "bg-blue-500 shadow-blue-500/50 shadow-md" : "bg-gray-600"}`}
              style={{ boxShadow: notifications ? '0 0 10px 5px rgba(40, 100, 250, 0.6)' : 'none' }}
            />
          </div>

          <div className={`${boxStyle} p-4 rounded-2xl shadow-md border flex justify-between items-center`}>
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
          className={`${boxStyle} p-6 rounded-3xl shadow-md border flex justify-between items-center`}
        >
          <div>
            <h2 className="text-lg font-semibold mb-2">Your Most Recent Playlist</h2>
            <p className="text-gray-400 text-sm">"Chill Vibes Mix"</p>
            <Link href="/playlist-view" className="text-blue-400 text-sm hover:underline flex items-center mt-2">
              View Playlist <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="w-30 h-30 bg-gray-700 rounded-lg" /> {/* placeholder */}
        </motion.div>

        {/* Library */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className={`${boxStyle} p-6 rounded-3xl shadow-md border`}
        >
          <h2 className="text-lg font-semibold mb-2">Your Library</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="w-full h-20 bg-gray-700 rounded-lg">
              <h3>{savedTracksData? savedTracksData[0]?.name : "Loading. . ."}</h3>
            </div>
            <div className="w-full h-20 bg-gray-700 rounded-lg">
            <h3>{savedTracksData? savedTracksData[1]?.name : "Loading. . ."}</h3>
            </div>
            <div className="w-full h-20 bg-gray-700 rounded-lg">
            <h3>{savedTracksData? savedTracksData[2]?.name : "Loading. . ."}</h3>
            </div>
            <div className="w-full h-20 bg-gray-700 rounded-lg">
            <h3>{savedTracksData? savedTracksData[3]?.name : "Loading. . ."}</h3>
            </div>
          </div>
          <Link href="/library" className="text-blue-400 text-sm hover:underline flex items-center mt-2">
            Open Library <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </motion.div>


        {/* user stats?? */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className={`${boxStyle} p-6 rounded-3xl shadow-md border flex justify-between items-center`}
        >
	    <div>
		<h2 className="text-lg font-semibold mb-2">Your Listening Stats</h2>
		<p className="text-gray-400 text-sm"><strong>Top Genre:</strong> Lo-Fi</p>
		{topArtistsData && topArtistsData.length > 0 ? (
      <p className="text-gray-400 text-sm"><strong>Top Artist:</strong> {topArtistsData[0]?.name || "Unknown Artist"}</p>
    ) : (
      <p className="text-gray-400 text-sm"><strong>Top Artist:</strong> No artist found </p>
    )}
    {topTracksData && topTracksData.length > 0 ? (
      <p className="text-gray-400 text-sm"><strong>Top Song:</strong> {topTracksData[0]?.name || "Unknown Song"}</p>
    ) : (
      <p className="text-gray-400 text-sm"><strong>Top Song:</strong> Loading...</p>
    )}
    {/*<p className="text-gray-400 text-sm"><strong>Top Artist:</strong> {topArtistsData[0]?.name || "Loading..."}</p>
		<p className="text-gray-400 text-sm"><strong>Top Song:</strong> {topTracksData[0]?.name || "Loading..."}</p> */}
    
	    </div>
	  <div className="w-30 h-30 bg-gray-700 rounded-lg mb-3"></div> {/* placeholder */}
        </motion.div>
	    
      </div>

    </div>
    
    );
};

export default Profile
