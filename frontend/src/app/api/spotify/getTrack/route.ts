import { NextRequest, NextResponse } from 'next/server';
// get function that will get tracks from the Spotify API
import { getTrack } from "@/lib/spotifyAPI";

// define interface for query parameters
interface GetTrackParams {
    accessToken: string | null;
    trackID: string | null;
}

export async function GET(req: NextRequest): Promise<NextResponse>{
    const url = new URL(req.url);

    // take query parameters from url
    const { accessToken, trackID }: GetTrackParams = {
        accessToken: url.searchParams.get('accessToken'),
        trackID: url.searchParams.get('trackID')
    }
    

    if(!accessToken || !trackID){
        return new NextResponse(JSON.stringify({ error: 'Access token or track ID not found' }), { status: 400 });
    };
    try {
        // get track data
        const trackData = await getTrack(accessToken, trackID);
        return new NextResponse(JSON.stringify(trackData), { status: 200 });
    } catch (error){
        console.error('Error fetching track: ', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch track' }), { status: 500 });
    }
}