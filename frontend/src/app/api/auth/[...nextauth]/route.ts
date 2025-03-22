
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
}

// can add more scopes later
// User scopes -> user-read-private, user-read-email, user-top-read, user-library-read (Could add Save Tracks for Current User with user-library-modify scope)
// Playlist scopes -> playlist-modify-public, playlist-modify-private, playlist-read-private, playlist-read-collaborative (Could add Custom Playlist Cover Image with ugc-image-upload scope) 
const scope = 'user-read-private user-read-email user-library-read user-top-read playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative'; 

// Spotify authorization URL, uses scope as a parameter
const authorizationUrl = `https://accounts.spotify.com/authorize?scope=${scope}`;

const authOptions:  NextAuthOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID || "",
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
            authorization: authorizationUrl
        }),
    ],
    // gives authorize code and access token
    callbacks: {
        // uses JWT, json web token, for role verification and user permissons
        async jwt({ token, account }) {
            if (account) {
                (token as ExtendedJWT).accessToken = account.access_token;
                (token as ExtendedJWT).refreshToken = account.refresh_token;
            }
            return token;
        },
        async session({ session, token }) {
            if ((token as ExtendedJWT).accessToken){
                session.accessToken = (token as ExtendedJWT).accessToken;
            }
            return session;
        },
    },
};


const handler = NextAuth(authOptions);

// export HTTP methods
export { handler as GET, handler as POST };