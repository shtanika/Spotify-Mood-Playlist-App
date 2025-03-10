// authorize a user

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