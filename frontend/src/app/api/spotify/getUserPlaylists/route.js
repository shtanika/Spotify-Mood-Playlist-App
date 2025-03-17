// get function that will get user playlists from the Spotify API
import { getUserPlaylists } from "@/lib/spotifyAPI";

export async function GET(req) {
    const url = new URL(req.url);
    const accessToken = url.searchParams.get('accessToken');
    const offset = url.searchParams.get('offset') || 0; // starts at index 0
    const limit = url.searchParams.get('limit') || 5; // limit response to 5 playlists

    // if access token is not found, return error
    if (!accessToken) {
        return new Response(JSON.stringify({ error: 'Access token not found' }), { status: 400 }); 
    }
    try {
        // get current user's playlists
        const playlistsData = await getUserPlaylists(accessToken, offset, limit);
        return new Response(JSON.stringify(playlistsData), {status:200});
    } catch {
        console.error('Error fetching user playlists: ', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch user playlists'}), {status: 500});
    }
}