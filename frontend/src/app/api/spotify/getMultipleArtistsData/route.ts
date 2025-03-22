import { NextRequest, NextResponse } from 'next/server';
// get function that will fetch artist data from the Spotify API
import { getMultipleArtistsData } from "@/lib/spotifyAPI";

// define interface for expected url parameters
interface GetMultipleArtistsDataParams {
    accessToken: string | null;
    artistIDs: string | null;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const url = new URL(req.url);

    // take query parameters from url
    const { accessToken, artistIDs }: GetMultipleArtistsDataParams =    {
        accessToken: url.searchParams.get('accessToken'),
        artistIDs: url.searchParams.get('artistIDs')
    }
    
    // if access token or artist IDs are not found, return error
    if (!accessToken || !artistIDs) {
        return new NextResponse(JSON.stringify({ error: 'Access token or artist IDs not found' }), { status: 400 });
    }
    try {
        // use the getMultipleArtistsData function to fetch the artist data
        const artistData = await getMultipleArtistsData(accessToken, artistIDs);
        return new NextResponse(JSON.stringify(artistData), { status: 200 });
    } catch (error){
        console.error('Error fetching artist data: ', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch artist data' }), { status: 500 });
    }
}
