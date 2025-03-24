import { NextRequest, NextResponse} from 'next/server';
// get function that will get specific playlists from the Spotify API
import { getPlaylist } from "@/lib/spotifyAPI";

// define interface for url parameters
interface GetPlaylistParams {
    accessToken: string | null;
    playlistID: string | null;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const url = new URL(req.url);

    // take query parameters from url
    const { accessToken, playlistID }: GetPlaylistParams = {
        accessToken: url.searchParams.get('accessToken'),
        playlistID: url.searchParams.get('playlistID')
    };


    // if access token or playlist ID is not found, return error
    if (!accessToken || !playlistID) {
        return new NextResponse(JSON.stringify({ error: 'Access token or playlist ID not found' }), { status: 400 });
    }
    try {
        // get playlist data
        const playlistData = await getPlaylist(accessToken, playlistID);
        return new NextResponse(JSON.stringify(playlistData), { status: 200 });
    } catch (error){
        console.error('Error fetching playlist: ', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch playlist' }), { status: 500 });
    }
}