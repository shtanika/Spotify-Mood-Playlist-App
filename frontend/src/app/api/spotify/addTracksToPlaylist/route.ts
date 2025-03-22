import { NextRequest, NextResponse } from 'next/server';
// get function that will add tracks to playlists from the Spotify API
import { addTracksToPlaylist } from "@/lib/spotifyAPI";

interface AddTracksToPlaylistRequest{
    accessToken: string;
    playlistID: string;
    tracksToURIs: { id: string }[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    const { accessToken, playlistID, tracksToURIs }: AddTracksToPlaylistRequest = await req.json(); // get parameter data from request body (send tracks to convert to URIs)
    
    if ( !accessToken || !playlistID || !tracksToURIs){
        return new NextResponse(JSON.stringify({ error: 'Access token, playlist ID or track URIs not found' }), { status: 400 });
    }

    try {
        // convert tracks to array of URIs
        const track_uris: string[] = tracksToURIs.map(track => `spotify:track:${track.id}`);

        // add tracks to the playlist
        const result = await addTracksToPlaylist(accessToken, playlistID, track_uris);
        return new NextResponse(JSON.stringify(result), { status: 201 });
    } catch (error) {
        console.error('Error adding tracks to playlist: ', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to add tracks to playlist' }), { status: 500 });
    }
}