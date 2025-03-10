'use client';

import React from 'react'
import { useSession } from 'next-auth/react';
import { useEffect, useState } from "react";

const Profile = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState("");
  const [tag, setTag] = useState("");
  const [limit, setLimit] = useState(5);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState("");

  
  useEffect(() => {
    console.log("useEffect triggered");
    console.log("Session Status:", status);
    console.log("Session: ", session);
    if (status === "loading") return;
    if (status === "authenticated") {
      console.log("Authenticated");
      console.log("Access Token: ", session.accessToken);
      if (session?.accessToken) {
        console.log("Access token available: ", session.accessToken);
        // Fetch user data from API route
        const fetchUserData = async () => {
          try {
            const response = await fetch(`/api/spotify/userData?accessToken=${session.accessToken}`);
            console.log("API response status: ", response.status);
            const data = await response.json();
            console.log("Fetched User Data: ", data);
            setUserData(data);
          } catch(error) {
            console.error("Error fetching user data: ", error);
          }
        };
        fetchUserData();
      } else {
        console.log("Access token not available");
      }
    }
    
  }, [session?.accessToken, status]);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();

    if(!searchTerm){
      setError('Search term is required');
      return;
    }
    try{
      const response = await fetch(`/api/spotify/searchTracks?accessToken=${session.accessToken}&search=${searchTerm}&genre=${genre}&tag=${tag}&limit=${limit}`);
      const data = await response.json();
      console.log("Search Data: ", data);
      if (response.ok){
        setTracks(data.tracks || []);
        setError('');
      } else {
        setTracks([]);
        setError(data.error || 'Failed to fetch search tracks');
      }
    } catch (error){
      console.error('Error searching tracks: ', error);
      setTracks([]);
      setError('Failed to fetch search tracks');
    }
  };

  if (status === "loading") return <p>Loading session. . .</p>
  return (
    <div className="flex flex-col items-center justify-start pt-[64px] px-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div>
        <h1>Profile</h1>
        {userData ? (
          <>
          <h1>
            {userData.display_name}
          </h1>
          <img src={userData.images[0]?.url} alt="User Profile" />
          <p>
            Email: {userData.email}
            </p>
          </>
        ) : (
          <p>Loading User data from Spotify. . .</p>
        )}
      </div>
      <div>
        <h2>Search Tracks</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search term"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='border border-gray-300 rounded-md p-2'
          />
          <input
            type="text"
            placeholder="Genre (optional)"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className='border border-gray-300 rounded-md p-2'
          />
          <input
            type="text"
            placeholder="Tag (optional)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className='border border-gray-300 rounded-md p-2'
          />
          <input
            type="number"
            min="1"
            max="20"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className='border border-gray-300 rounded-md p-2'
          />
          <button type="submit" className='border border-gray-300 rounded-md p-2'>Search</button>
          {error && <p>{error}</p>}
        </form>
        {tracks.length > 0 && (  
          <div className="mt-8">
            <h3>Search Results</h3>
            <ul>
              {tracks.map((track) => (
                <li key={track.id} className="mb-4">
                  <img src={track.albumImageUrl} alt={track.album} width="50" />
                  <div>{track.name}</div>
                  <div>{track.artist}</div>
                  <div>{track.album}</div>
                </li>
              ))}
              </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;