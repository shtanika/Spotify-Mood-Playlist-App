
/* Resources
    Spotify Web API - Authorization Code Flow
    https://developer.spotify.com/documentation/web-api/tutorials/code-flow

    NextAuth.js - Getting Started and SpotifyProvider
    https://next-auth.js.org/getting-started/example
    https://next-auth.js.org/providers/spotify#example

    Helpful blog, using nextauth approach
    https://dev.to/matdweb/how-to-authenticate-a-spotify-user-in-nextjs-14-using-nextauth-5f6i
*/

import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';

// can add more scopes later
const scope = 'user-read-private user-read-email';

// Spotify authorization URL, uses scope as a parameter
const authorizationUrl = `https://accounts.spotify.com/authorize?scope=${scope}`;

export const handler = NextAuth({
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            authorization: authorizationUrl
        }),
    ],
    // gives authorize code and access token
    callbacks: {
        // uses JWT, json web token, for role verification and user permissons
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.accessToken;
                token.refreshToken = account.refreshToken;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            return session;
        },
    },
});


export { handler as GET, handler as POST };

