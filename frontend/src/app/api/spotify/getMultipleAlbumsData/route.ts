import { NextRequest, NextResponse } from 'next/server';
// get function that will fetch multiple album data from the Spotify API
import { getMultipleAlbumsData } from "@/lib/spotifyAPI";

// define interface for url parameters
interface GetMultipleAlbumsDataParams {
    accessToken: string | null;
    albumIDs: string | null;
}

export async function GET(req: NextRequest): Promise<NextResponse>{
    const url = new URL(req.url);

    // take query parameters from url
    const { accessToken, albumIDs }: GetMultipleAlbumsDataParams = {
        accessToken: url.searchParams.get('accessToken'),
        albumIDs: url.searchParams.get('albumIDs')
    };
    
    // if access token or album IDs are not found, return error
    if (!accessToken || !albumIDs) {
        return new NextResponse(JSON.stringify({ error: 'Access token or album IDs not found' }), { status: 400 });
    }
    try {
        // use the getMultipleAlbumsData function to fetch the album data
        const albumData = await getMultipleAlbumsData(accessToken, albumIDs);
        return new NextResponse(JSON.stringify(albumData), { status: 200 });
    } catch (error){
        console.error('Error fetching album data: ', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch album data' }), { status: 500 });
    }
}
