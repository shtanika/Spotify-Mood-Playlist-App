import { NextRequest, NextResponse } from 'next/server';
// get function that will fetch album data from the Spotify API
import { getAlbumData } from "@/lib/spotifyAPI";

// define an interface for url parameters
interface GetAlbumDataParams {
    accessToken: string | null;
    albumID: string | null;
}

export async function GET(req: NextRequest): Promise<NextResponse>{
    const url = new URL(req.url);

    // take query parameters from url
    const { accessToken, albumID }: GetAlbumDataParams = {
        accessToken: url.searchParams.get('accessToken'),
        albumID: url.searchParams.get('albumID')
    };

    // if access token or album ID is not found, return error
    if(!accessToken || !albumID){
        return new NextResponse(JSON.stringify({ error: 'Access token or album ID not found' }), { status: 400 });
    }
    try{
        const albumData = await getAlbumData(accessToken, albumID);
        return new NextResponse(JSON.stringify(albumData), { status: 200 });
    } catch (error){
        console.error('Error fetching album data: ', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch album data' }), { status: 500 });
    }
}