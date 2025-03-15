// get function that will fetch album data from the Spotify API
import { getAlbumData } from "@/lib/spotifyAPI";

export async function GET(req){
    const url = new URL(req.url);
    const accessToken = url.searchParams.get('accessToken');
    const albumID = url.searchParams.get('albumID');

    // if access token or album ID is not found, return error
    if(!accessToken || !albumID){
        return new Response(JSON.stringify({ error: 'Access token or album ID not found' }), { status: 400 });
    }
    try{
        const albumData = await getAlbumData(accessToken, albumID);
        return new Response(JSON.stringify(albumData), { status: 200 });
    } catch (error){
        console.error('Error fetching album data: ', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch album data' }), { status: 500 });
    }
}