// get function that will create playlists from the Spotify API

import { createSpotifyPlaylist } from "@/lib/spotifyAPI";

export async function POST(req){
    const { accessToken, playlist_name, playlist_description, publicPlaylist } = await req.json(); // get parameter data from request body

    // if access token or name is not found, return error
    if(!accessToken || !playlist_name){
        return new Response(JSON.stringify({ error: 'Access token or playlist name not found' }), { status: 400 });
    }

    try {
        // Call the createSpotifyPlaylist function to create a playlist on Spotify
        const createdPlaylist = await createSpotifyPlaylist(accessToken, playlist_name, playlist_description, publicPlaylist);

        // return the created playlist data
        return new Response(JSON.stringify(createdPlaylist), { status: 201 });
    }
    catch(error){
        console.error('Error creating playlist: ', error);
        return new Response(JSON.stringify({ error: 'Failed to create playlist' }), { status: 500 });
    }
    

}
