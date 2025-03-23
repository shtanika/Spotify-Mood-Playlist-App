import { NextRequest, NextResponse } from 'next/server';
// get function that will create playlists from the Spotify API
import { createSpotifyPlaylist } from "@/lib/spotifyAPI";

// define interface for request body
interface CreatePlaylistRequest {
    accessToken: string;
    playlist_name: string;
    playlist_description?: string;
    publicPlaylist?: boolean;
}


export async function POST(req: NextRequest): Promise<NextResponse> {
    const { accessToken, playlist_name, playlist_description, publicPlaylist }: CreatePlaylistRequest = await req.json(); // get parameter data from request body

    // if access token or name is not found, return error
    if(!accessToken || !playlist_name){
        return new NextResponse(JSON.stringify({ error: 'Access token or playlist name not found' }), { status: 400 });
    }

    try {
        // Call the createSpotifyPlaylist function to create a playlist on Spotify
        const createdPlaylist = await createSpotifyPlaylist(accessToken, playlist_name, playlist_description, publicPlaylist);

        // return the created playlist data
        return new NextResponse(JSON.stringify(createdPlaylist), { status: 201 });
    }
    catch(error){
        console.error('Error creating playlist: ', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to create playlist' }), { status: 500 });
    }
    

}
