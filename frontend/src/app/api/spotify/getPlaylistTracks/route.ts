import { NextRequest, NextResponse } from 'next/server';
// get function that will get tracks from playlists with the Spotify API
import { getPlaylistTracks } from "@/lib/spotifyAPI";

// define interface for query parameters
interface GetPlaylistTracksParams {
    accessToken: string | null;
    playlistID: string | null;
    offset: number;
    limit: number;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const url = new URL(req.url);

    // take query parameters from url
    const { accessToken, playlistID, offset, limit }: GetPlaylistTracksParams = {
        accessToken: url.searchParams.get('accessToken'),
        playlistID: url.searchParams.get('playlistID'),
        offset: parseInt(url.searchParams.get('offset') ?? '0') || 0,
        limit: parseInt(url.searchParams.get('limit') ?? '5') || 5
    };
    
    if(!accessToken || !playlistID){
        return new NextResponse(JSON.stringify({ error: 'Access token or playlist ID not found' }), { status: 400 });
    }
    try {
        // get playlist tracks data
        const playlistData = await getPlaylistTracks(accessToken, playlistID, offset, limit);
        return new NextResponse(JSON.stringify(playlistData), { status: 200 });
    } catch (error){
        console.error('Error fetching playlist tracks: ', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch playlist tracks' }), { status: 500 });
    }
}