import { NextRequest, NextResponse } from 'next/server';
// get function that will get user playlists from the Spotify API
import { getUserPlaylists } from "@/lib/spotifyAPI";

// define interface for query parameters
interface GetUserPlaylistsParams {
    accessToken: string | null;
    offset: number | 0;
    limit: number | 5;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const url = new URL(req.url);

    // take query parameters from url
    const { accessToken , offset, limit }: GetUserPlaylistsParams = {
        accessToken: url.searchParams.get('accessToken'),
        offset: parseInt(url.searchParams.get('offset') ?? '0') || 0,
        limit: parseInt(url.searchParams.get('limit') ?? '5') || 5
    }

    
    // if access token is not found, return error
    if (!accessToken) {
        return new NextResponse(JSON.stringify({ error: 'Access token not found' }), { status: 400 }); 
    }
    try {
        // get current user's playlists
        const playlistsData = await getUserPlaylists(accessToken, offset, limit);
        return new NextResponse(JSON.stringify(playlistsData), {status:200});
    } catch (error) {
        console.error('Error fetching user playlists: ', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch user playlists'}), {status: 500});
    }
}