// get function that will fetch the top tracks from the Spotify API

import { getSpotifyTopTracks } from "@/lib/spotifyAPI";

export async function GET(req){
    const url = new URL(req.url);
    const accessToken = url.searchParams.get('accessToken');
    const limit = url.searchParams.get('limit') || 5; // if no limit is provided, default to 5

    // if access token is not found, return error
    if(!accessToken){
        return new Response(JSON.stringify({ error: 'Access token not found' }), { status: 400 });
    }
    try {
        const topTracks = await getSpotifyTopTracks(accessToken, limit);
        return new Response(JSON.stringify(topTracks), { status: 200 });
    } catch(error){
        console.error('Error fetching top tracks: ', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch top tracks' }), { status: 500 });
    }
}   
