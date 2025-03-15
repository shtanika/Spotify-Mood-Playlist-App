// get function that will fetch artist data from the Spotify API
import { getMultipleArtistsData } from "@/lib/spotifyAPI";

export async function GET(req){
    const url = new URL(req.url);
    const accessToken = url.searchParams.get('accessToken');
    const artistIDs = url.searchParams.get('artistIDs'); // string of artist IDs, separated with commas

    // if access token or artist IDs are not found, return error
    if (!accessToken || !artistIDs) {
        return new Response(JSON.stringify({ error: 'Access token or artist IDs not found' }), { status: 400 });
    }
    try {
        // use the getMultipleArtistsData function to fetch the artist data
        const artistData = await getMultipleArtistsData(accessToken, artistIDs);
        return new Response(JSON.stringify(artistData), { status: 200 });
    } catch (error){
        console.error('Error fetching artist data: ', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch artist data' }), { status: 500 });
    }
}
