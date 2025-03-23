import { NextRequest, NextResponse } from 'next/server';
// get function that will handle the search tracks from the Spotify API

import { searchTracks } from "@/lib/spotifyAPI";

// define interface for query parameters
interface SearchTracksParams {
    accessToken: string | null;
    search: string | null;
    genre: string;
    tag: string;
    limit: number;
}

export async function GET(req: NextRequest): Promise<NextResponse>{
    const url = new URL(req.url);

    // take query parameters from url
    const { accessToken, search, genre, tag, limit }: SearchTracksParams = {
        accessToken: url.searchParams.get('accessToken'),
        search: url.searchParams.get('search'), // get search term from URL
        genre: url.searchParams.get('genre') || '', // get genre from URL, default to empty string if not provided
        tag: url.searchParams.get('tag') || '', // get tag from URL, default to empty string if not provided
        limit: parseInt(url.searchParams.get('limit') ?? '5') || 5 // if no limit is provided, default to 5
    };
    

    // if access token is not found, return error
    if(!accessToken){
        return new NextResponse(JSON.stringify({ error: 'Access token not found' }), { status: 400 });
    }
    // if value of search does not exist, return error 
    if(!search){
        return new NextResponse(JSON.stringify({ error: 'Search term not found' }), { status: 400 });
    }
    try {
        // Call the searchTracks function to fetch the search tracks from the Spotify API
        const searchTracksData = await searchTracks(accessToken, search, genre, tag, limit);

        // return the search tracks data
        return new NextResponse(JSON.stringify(searchTracksData), { status: 200 });
    } catch(error){
        console.error('Error fetching search tracks: ', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch search tracks' }), { status: 500 });
    }

}
