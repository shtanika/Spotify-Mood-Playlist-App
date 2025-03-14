// get function that will get tracks from the Spotify API
import { getTrack } from "@/lib/spotifyAPI";

export async function GET(req){
    const url = new URL(req.url);
    const accessToken = url.searchParams.get('accessToken');
    const trackID = url.searchParams.get('trackID');

    if(!accessToken || !trackID){
        return new Response(JSON.stringify({ error: 'Access token or track ID not found' }), { status: 400 });
    };
    try {
        // get track data
        const trackData = await getTrack(accessToken, trackID);
        return new Response(JSON.stringify(trackData), { status: 200 });
    } catch (error){
        console.error('Error fetching track: ', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch track' }), { status: 500 });
    }
}