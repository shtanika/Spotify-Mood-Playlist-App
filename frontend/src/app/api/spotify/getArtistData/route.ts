import { NextRequest, NextResponse } from 'next/server';
// get function that will fetch artist data from the Spotify API
import { getArtistData } from "@/lib/spotifyAPI";

// define interface for url parameters
interface GetArtistDataParams {
    accessToken: string | null;
    artistID: string | null;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const url = new URL(req.url);

    // take query parameters from url
    const { accessToken, artistID }: GetArtistDataParams = {
        accessToken: url.searchParams.get('accessToken'),
        artistID: url.searchParams.get('artistID')
    };


    // if access token or artist ID is not found, return error
    if(!accessToken || !artistID){
        return new NextResponse(JSON.stringify({ error: 'Access token or artist ID not found' }), { status: 400 });
    }
    try{
        // use the getArtistData function to fetch the artist data
        const artistData = await getArtistData(accessToken, artistID);
        return new NextResponse(JSON.stringify(artistData), { status: 200 });
    } catch (error){
        console.error('Error fetching artist data: ', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch artist data' }), { status: 500 });
    }

}
