// get function that will get tracks from playlists with the Spotify API
import { getPlaylistTracks } from "@/lib/spotifyAPI";

export async function GET(req){
    const url = new URL(req.url);
    const accessToken = url.searchParams.get('accessToken');
    const playlistID = url.searchParams.get('playlistID');
    const offset = parseInt(url.searchParams.get('offset')) || 0; // if no offset is provided, default to 0
    const limit = parseInt(url.searchParams.get('limit')) || 5; // if no limit is provided, default to 5

    if(!accessToken || !playlistID){
        return new Response(JSON.stringify({ error: 'Access token or playlist ID not found' }), { status: 400 });
    }
    try {
        // get playlist tracks data
        const playlistData = await getPlaylistTracks(accessToken, playlistID, offset, limit);
        return new Response(JSON.stringify(playlistData), { status: 200 });
    } catch (error){
        console.error('Error fetching playlist tracks: ', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch playlist tracks' }), { status: 500 });
    }
}