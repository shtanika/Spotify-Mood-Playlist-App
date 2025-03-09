'use client';

import React from 'react'
import { useSession } from 'next-auth/react';
import { useEffect, useState } from "react";

const Profile = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  
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
    </div>
  );
};

export default Profile