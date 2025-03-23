import { NextRequest, NextResponse } from 'next/server';
// get function that will fetch the top tracks from the Spotify API

import { getSpotifyTopTracks } from "@/lib/spotifyAPI";

// define interface for query parameters
interface GetTopTracksParams {
    accessToken: string | null;
    limit: number;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const url = new URL(req.url);

    // take query parameters from url
    const { accessToken, limit }: GetTopTracksParams = {
        accessToken: url.searchParams.get('accessToken'),
        limit: parseInt(url.searchParams.get('limit') ?? '5') || 5 // if no limit is provided, default to 5
    }

    // if access token is not found, return error
    if(!accessToken){
        return new NextResponse(JSON.stringify({ error: 'Access token not found' }), { status: 400 });
    }
    try {
        const topTracks = await getSpotifyTopTracks(accessToken, limit);
        return new NextResponse(JSON.stringify(topTracks), { status: 200 });
    } catch(error){
        console.error('Error fetching top tracks: ', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch top tracks' }), { status: 500 });
    }
}   
