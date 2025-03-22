// utility file that will contain all the functions that will interact with the Spotify API


// interfaces for specific functions

interface PlaylistTracksResponse {
    items: { track: SpotifyTrack }[];
    total: number;
    limit: number;
    offset: number;
}

interface UserPlaylistsResponse {
    items: SpotifyPlaylist[];
    next: string | null;
    previous: string | null;
    total: number;
}

// interfaces for track, artist, album, playlist.

interface SpotifyTrack {
    id: string;
    name: string;
    artists: SimplifiedArtist[]; // concatenated artist as string, for array of Artists instead of string use SpotifyArtist[]
    album: SpotifyAlbum;
    albumImageUrl: string;
    preview_url?: string | null; // deprecated, could remove
}

interface SpotifyArtist {
    id: string;
    name: string;
    genres: string[];
    images: { url: string }[];
}

interface SpotifyAlbum {
    id: string;
    name: string;
    images: { url: string }[];
}

interface SpotifyPlaylist {
    id: string;
    name: string;
    description: string;
    public: boolean;
}

interface SpotifyUser {
    id: string;
    display_name: string;
    email: string;
    images: { url: string }[];
}

// simplified objects, use if you dont need full objects
interface SimplifiedArtist {
    external_url: { [platform: string]: string }; // platform = spotify for example. can contain multiple urls
    href: string | null;
    id: string;
    name: string;
    type: string;
    uri: string;
}

// helper function to fetch data from spotify web api

const fetchSpotifyData = async <T>(url: string, accessToken: string): Promise<T> => {
    // fetch response using access token
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    
    // if response is not okay, throw an error
    if (!response.ok) {
        throw new Error('Failed to fetch Spotify data');
    }

    // return response as json
    return response.json()
}


// Reference: https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile 
export const getSpotifyUserData = async (accessToken: string): Promise<SpotifyUser> => {
    const url = 'https://api.spotify.com/v1/me';
    return await fetchSpotifyData<SpotifyUser>(url, accessToken);
};

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-users-saved-tracks/
export const getSpotifySavedTracks = async (accessToken: string, limit: number = 5): Promise<SpotifyTrack[]> => {
    const savedTracksUrl = `https://api.spotify.com/v1/me/tracks?limit=${limit}`;
    const tracksData = await fetchSpotifyData<{items: { track: SpotifyTrack }[] }>(savedTracksUrl, accessToken);
    
    // return tracks with relevant data
    return tracksData.items.map(item => ({
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists,
        album: item.track.album,
        albumImageUrl: item.track.album.images[0]?.url ?? ''
    }));
};

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks/
export const getSpotifyTopTracks = async (accessToken: string, limit: number = 5): Promise<SpotifyTrack[]> => {
    const topTracksUrl = `https://api.spotify.com/v1/me/top/tracks?limit=${limit}`; // can also change tracks to artists to get top artists instead of tracks
    const tracksData = await fetchSpotifyData<{ items: SpotifyTrack[] }>(topTracksUrl, accessToken);

    // return top tracks with relevant data
    return tracksData.items.map(item => ({
        id: item.id,
        name: item.name,
        artists: item.artists,
        album: item.album,
        albumImageUrl: item.album.images[0]?.url
    }));
};


// Reference: https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks/
export const getSpotifyTopArtists = async (accessToken: string, limit: number = 5): Promise<SpotifyArtist[]> => {
    const topArtistsUrl = `https://api.spotify.com/v1/me/top/artists?limit=${limit}`; // url to get top artists
    const data = await fetchSpotifyData<{ items: SpotifyArtist[] }>(topArtistsUrl, accessToken);
    return data.items;
};

// Reference: https://developer.spotify.com/documentation/web-api/reference/search
export const searchTracks = async (accessToken: string, search: string, genre: string = '', tag: string = '', limit: number = 5): Promise<{ tracks: SpotifyTrack[] }> => {
    // start with basic search term
    let query = search;
    
    // if genre is provided, add to query
    if (genre){
        query += ` genre:${genre}`;
    }  

    // if tag is provided, add to query
    if (tag){
        query += ` tag:${tag}`;
    }

    // build search URL
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`; // can change type to artist, album, playlist, etc to search for those instead of tracks

    // fetch data from Spotify API
    return await fetchSpotifyData(searchUrl, accessToken);
};

// Gets more specific data of a track
// Doesn't contain genre of a track, you will need to use the album's genre or artist's genre
// Reference: https://developer.spotify.com/documentation/web-api/reference/get-track
export const getTrack = async (accessToken: string, trackID: string): Promise<SpotifyTrack> => {
    const url = `https://api.spotify.com/v1/tracks/${trackID}`; // API endpoint to get a track

    // fetch track data from spotify web api
    return await fetchSpotifyData<SpotifyTrack>(url,accessToken);
};



// Artist and Album functions
// Possible to get genre of an artist or album

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-an-artist
export const getArtistData = async (accessToken: string, artistID: string): Promise<SpotifyArtist> => {
    const url = `https://api.spotify.com/v1/artists/${artistID}`; // API endpoint to get an artist

    // fetch artist data from spotify web api
    return await fetchSpotifyData<SpotifyArtist>(url, accessToken);
};

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-multiple-artists
// artistIDs is a string of artist IDs separated by commas
export const getMultipleArtistsData = async (accessToken: string, artistIDs: string): Promise<{ artists: SpotifyArtist[] }> => {
    const url = `https://api.spotify.com/v1/artists?ids=${artistIDs}`; // API endpoint to get multiple artists

    // fetch multiple artists data from spotify api
    return await fetchSpotifyData<{ artists: SpotifyArtist[] }>(url, accessToken);
};

// Get Album data

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-an-album
export const getAlbumData = async (accessToken: string, albumID: string): Promise<SpotifyAlbum> => {
    const url = `https://api.spotify.com/v1/albums/${albumID}`; // API endpoint to get an album

    // fetch album data from spotify web api
    return await fetchSpotifyData<SpotifyAlbum>(url, accessToken);
};

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-multiple-albums
// albumIDs is a string of album IDs separated by commas
export const getMultipleAlbumsData = async (accessToken: string, albumIDs: string): Promise<{ albums: SpotifyAlbum[] }> => {
    const url = `https://api.spotify.com/v1/albums?ids=${albumIDs}`; // API endpoint to get multiple albums

    // fetch multiple albums data from the spotify web api
    return await fetchSpotifyData<{ albums: SpotifyAlbum[] }>(url, accessToken);
};

// Playlist functions (NEEDS MORE TESTING)
// Deleting a playlist is not supported by the Spotify API, but you can remove tracks from a playlist

// Reference: https://developer.spotify.com/documentation/web-api/reference/create-playlist
// One of the responses will be the playlist ID which can be used to add tracks to the playlist or adding the playlist into the database 
export const createSpotifyPlaylist = async (accessToken: string, playlist_name: string, playlist_description: string = '', publicPlaylist: boolean = false): Promise<SpotifyPlaylist> => {
    const url = 'https://api.spotify.com/v1/me/playlists'; // endpoint to create a playlist for authenticated user

    const response = await fetch(url,{
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: playlist_name,
            description: playlist_description,
            public: publicPlaylist, // set to true to make playlist public
        }),
    });

    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to create Spotify playlist');
    }

    // Return the created playlist data
    return response.json();
};


// Reference: https://developer.spotify.com/documentation/web-api/reference/add-tracks-to-playlist
export const addTracksToPlaylist = async (accessToken: string, playlistID: string, trackURIs: string[]): Promise<{ snapshot_id: string}> => {
    const url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`; // API endpoint to add tracks to a playlist

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            uris: trackURIs,
        }),
    });

    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to add tracks to Playlist');
    }

    // Return the response as JSON 
    return response.json();
};

// Reference: https://developer.spotify.com/documentation/web-api/reference/remove-tracks-playlist
export const removeTracksFromPlaylist = async (accessToken: string, playlistID: string, trackURIs: string[]): Promise<{ snapshot_id: string }> => {
    const url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`; // API endpoint to remove tracks from a playlist

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tracks: trackURIs, // array of track uris to remove from the playlist
        }),
    });

    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to remove tracks from Playlist');
    }

    // Return the response as JSON
    return response.json();
};

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-playlist
export const getPlaylist = async (accessToken: string, playlistID: string): Promise<SpotifyPlaylist> => {
    const url = `https://api.spotify.com/v1/playlists/${playlistID}`; // API endpoint to get a playlist

    return await fetchSpotifyData<SpotifyPlaylist>(url, accessToken);
};

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-playlists-tracks
// offset is the index of the first track to return, limit is the maximum number of tracks to return
// if limit is not provided, default to 20
export const getPlaylistTracks = async (accessToken: string, playlistID: string, offset: number = 0, limit: number = 20): Promise<SpotifyTrack[]> => {
    const url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks?offset=${offset}&limit=${limit}`; // API endpoint to get tracks from a playlist

    // fetch playlist tracks response from spotify web api
    const data = await fetchSpotifyData<PlaylistTracksResponse>(url, accessToken);
    return data.items.map(item => item.track);
};

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-a-list-of-current-users-playlists
export const getUserPlaylists = async (accessToken: string, offset: number = 0, limit: number = 5): Promise<SpotifyPlaylist[]> => {
    const url = `https://api.spotify.com/v1/me/playlists?offset=${offset}&limit=${limit}`;

    // fetch user playlists response, then return items from that response.
    const data = await fetchSpotifyData<UserPlaylistsResponse>(url, accessToken);
    return data.items;
};