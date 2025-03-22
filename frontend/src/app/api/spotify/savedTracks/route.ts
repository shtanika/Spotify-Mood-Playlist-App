import { NextRequest, NextResponse } from 'next/server';
// get function that will fetch the saved tracks from the Spotify API
import { getSpotifySavedTracks } from "@/lib/spotifyAPI";

// define interface for query parameters
interface GetSavedTracksParams {
    accessToken: string | null;
    limit: number;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const url = new URL(req.url);

    // take query parameters from url
    const { accessToken, limit }: GetSavedTracksParams = {
        accessToken: url.searchParams.get('accessToken'),
        limit: parseInt(url.searchParams.get('limit') ?? '5') || 5
    };
    
    // if access token is not found, return error
    if(!accessToken){
        return new NextResponse(JSON.stringify({ error: 'Access token not found' }), { status: 400 });
    }
    try {
        // Fetch saved tracks from the Spotify API with the limit
        const savedTracks = await getSpotifySavedTracks(accessToken, limit);

        return new NextResponse(JSON.stringify(savedTracks), { status: 200 });
    } catch(error){
        console.error('Error fetching saved tracks: ', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch saved tracks' }), { status: 500 });
    }
}