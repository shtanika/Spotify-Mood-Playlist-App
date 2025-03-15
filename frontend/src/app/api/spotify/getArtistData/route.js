// get function that will fetch artist data from the Spotify API
import { getArtistData } from "@/lib/spotifyAPI";

export async function GET(req){
    const url = new URL(req.url);
    const accessToken = url.searchParams.get('accessToken');
    const artistID = url.searchParams.get('artistID');

    // if access token or artist ID is not found, return error
    if(!accessToken || !artistID){
        return new Response(JSON.stringify({ error: 'Access token or artist ID not found' }), { status: 400 });
    }
    try{
        // use the getArtistData function to fetch the artist data
        const artistData = await getArtistData(accessToken, artistID);
        return new Response(JSON.stringify(artistData), { status: 200 });
    } catch (error){
        console.error('Error fetching artist data: ', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch artist data' }), { status: 500 });
    }

}
