// get function that will get specific playlists from the Spotify API
import { getPlaylist } from "@/lib/spotifyAPI";

export async function GET(req){
    const url = new URL(req.url);
    const accessToken = url.searchParams.get('accessToken');
    const playlistID = url.searchParams.get('playlistID');

    // if access token or playlist ID is not found, return error
    if (!accessToken || !playlistID) {
        return new Response(JSON.stringify({ error: 'Access token or playlist ID not found' }), { status: 400 });
    }
    try {
        // get playlist data
        const playlistData = await getPlaylist(accessToken, playlistID);
        return new Response(JSON.stringify(playlistData), { status: 200 });
    } catch (error){
        console.error('Error fetching playlist: ', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch playlist' }), { status: 500 });
    }
}