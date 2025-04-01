
/* Resources
    Spotify Web API - Authorization Code Flow
    https://developer.spotify.com/documentation/web-api/tutorials/code-flow

    NextAuth.js - Getting Started and SpotifyProvider
    https://next-auth.js.org/getting-started/example
    https://next-auth.js.org/providers/spotify#example

    Helpful blog, using nextauth approach
    https://dev.to/matdweb/how-to-authenticate-a-spotify-user-in-nextjs-14-using-nextauth-5f6i
*/

import NextAuth, { NextAuthOptions } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import { JWT } from 'next-auth/jwt';

// type safety for JWT.
interface ExtendedJWT extends JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number; // store token expiration time
    spotifyId?: string; // store spotify user's id
}

// can add more scopes later
// User scopes -> user-read-private, user-read-email, user-top-read, user-library-read (Could add Save Tracks for Current User with user-library-modify scope)
// Playlist scopes -> playlist-modify-public, playlist-modify-private, playlist-read-private, playlist-read-collaborative (Could add Custom Playlist Cover Image with ugc-image-upload scope) 
const scope = 'user-read-private user-read-email user-library-read user-top-read playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative'; 

// Spotify authorization URL, uses scope as a parameter
const authorizationUrl = `https://accounts.spotify.com/authorize?scope=${scope}`;

// Add function to sync user with backend
async function syncUserWithBackend(userData: any) {
    const BACKEND_API_URL = process.env.BACKEND_API_URL;
    
    try {
        const response = await fetch(`${BACKEND_API_URL}/create_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                spotify_id: userData.id,
                email: userData.email,
                display_name: userData.display_name || userData.name,
                profile_image: userData.image || userData.picture
            }),
        });

        if (!response.ok) {
            console.error('Failed to sync user with backend:', await response.text());
        }
    } catch (error) {
        console.error('Error syncing user with backend:', error);
    }
}

const authOptions: NextAuthOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID || "",
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
            authorization: authorizationUrl
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'spotify') {
                // Get additional Spotify user data
                const response = await fetch('https://api.spotify.com/v1/me', {
                    headers: {
                        Authorization: `Bearer ${account.access_token}`,
                    },
                });
                
                if (response.ok) {
                    const spotifyData = await response.json();
                    // Sync user data with backend
                    await syncUserWithBackend({
                        id: spotifyData.id,
                        email: spotifyData.email,
                        display_name: spotifyData.display_name,
                        image: spotifyData.images?.[0]?.url
                    });
                }
            }
            return true;
        },
        async jwt({ token, account }) {
            if (account) {
                (token as ExtendedJWT).accessToken = account.access_token;
                (token as ExtendedJWT).refreshToken = account.refresh_token;
                (token as ExtendedJWT).accessTokenExpires = Date.now() + account.expires_in * 1000;
            
                // get spotify user id
                const response = await fetch('https://api.spotify.com/v1/me', {
                    headers: {
                        Authorization: `Bearer ${account.access_token}`
                    },
                });

                const data = await response.json();
                if (response.ok && data.id) {
                    (token as ExtendedJWT).spotifyId = data.id; // store spotify user id in the token
                }
            }
            if (Date.now() < (token as ExtendedJWT).accessTokenExpires!) {
                return token;
            }
            return refreshAccessToken(token as ExtendedJWT);
        },
        
        async session({ session, token }) {
            if ((token as ExtendedJWT).accessToken) {
                session.accessToken = (token as ExtendedJWT).accessToken;
            }
            // add spotify user id to session
            if((token as ExtendedJWT).spotifyId) {
                session.spotifyId = (token as ExtendedJWT).spotifyId;
            }
            return session;
        },
    },
};


// function to refresh access token
async function refreshAccessToken(token: ExtendedJWT){
    try{
        // fetch refresh token
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken!,
            }),
        });
        const refreshedToken = await response.json();

        //
        if (!response.ok){
            throw refreshedToken;
        }

        return {
            ...token,
            accessToken: refreshedToken.access_token,
            accessTokenExpires: Date.now() + refreshedToken.expires_in * 1000,
            refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
        };
    } catch (error){
        console.error('Error refreshing access token: ', error);
        return {
            ...token,
            error: 'Failed to refresh access token',
        };
    }
}


const handler = NextAuth(authOptions);

// export HTTP methods
export { handler as GET, handler as POST };
