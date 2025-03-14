// get function that will add tracks to playlists from the Spotify API
import { addTracksToPlaylist } from "@/lib/spotifyAPI";

export async function POST(req){
    const { accessToken, playlistID, tracksToURIs } = await req.json(); // get parameter data from request body (send tracks to convert to URIs)
    
    if ( !accessToken || !playlistID || !tracksToURIs){
        return new Response(JSON.stringify({ error: 'Access token, playlist ID or track URIs not found' }), { status: 400 });
    }

    try {
        // convert tracks to array of URIs
        const track_uris = tracksToURIs.map(track => `spotify:track:${track.id}`);

        // add tracks to the playlist
        const result = await addTracksToPlaylist(accessToken, playlistID, track_uris);
        return new Response(JSON.stringify(result), { status: 201 });
    } catch (error) {
        console.error('Error adding tracks to playlist: ', error);
        return new Response(JSON.stringify({ error: 'Failed to add tracks to playlist' }), { status: 500 });
    }
}