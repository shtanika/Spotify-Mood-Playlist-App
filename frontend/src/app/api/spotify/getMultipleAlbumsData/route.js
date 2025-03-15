// get function that will fetch multiple album data from the Spotify API
import { getMultipleAlbumsData } from "@/lib/spotifyAPI";

export async function GET(req){
    const url = new URL(req.url);
    const accessToken = url.searchParams.get('accessToken');
    const albumIDs = url.searchParams.get('albumIDs'); // string of album IDs, separated with commas

    // if access token or album IDs are not found, return error
    if (!accessToken || !albumIDs) {
        return new Response(JSON.stringify({ error: 'Access token or album IDs not found' }), { status: 400 });
    }
    try {
        // use the getMultipleAlbumsData function to fetch the album data
        const albumData = await getMultipleAlbumsData(accessToken, albumIDs);
        return new Response(JSON.stringify(albumData), { status: 200 });
    } catch (error){
        console.error('Error fetching album data: ', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch album data' }), { status: 500 });
    }
}
