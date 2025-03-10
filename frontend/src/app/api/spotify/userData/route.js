// get function that will fetch the user data from the Spotify API
import { getSpotifyUserData } from "@/lib/spotifyAPI";

export async function GET(req){
    const url = new URL(req.url);
    const accessToken = url.searchParams.get('accessToken');

    if(!accessToken){
        return new Response(JSON.stringify({ error: 'Access token not found' }), { status: 400 });
    }

    try {
        // use the getSpotifyUserData function to fetch the user data
        const userData = await getSpotifyUserData(accessToken);
        return new Response(JSON.stringify(userData), { status: 200 });
    } catch (error) {
        console.error('Error fetching user data: ', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch user data' }), { status: 500 });
    }
}
