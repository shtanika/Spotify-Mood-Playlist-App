import { NextRequest, NextResponse } from 'next/server';
// get function that will fetch the user data from the Spotify API
import { getSpotifyUserData } from "@/lib/spotifyAPI";

// define interface for query parameters
interface GetUserDataParams {
    accessToken: string | null;
}

export async function GET(req: NextRequest): Promise<NextResponse>{
    const url = new URL(req.url);

    // take access token from url
    const { accessToken }: GetUserDataParams = {
        accessToken: url.searchParams.get('accessToken')
    };

    if(!accessToken){
        return new NextResponse(JSON.stringify({ error: 'Access token not found' }), { status: 400 });
    }

    try {
        // use the getSpotifyUserData function to fetch the user data
        const userData = await getSpotifyUserData(accessToken);
        return new NextResponse(JSON.stringify(userData), { status: 200 });
    } catch (error) {
        console.error('Error fetching user data: ', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch user data' }), { status: 500 });
    }
}
