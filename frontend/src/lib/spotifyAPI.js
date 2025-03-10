// utility file that will contain all the functions that will interact with the Spotify API


// Reference: https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile 
export const getSpotifyUserData = async (accessToken) => {
    const response = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to get Spotify user data');
    }
    // return response as json
    return response.json();
};

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-users-saved-tracks/
export const getSpotifySavedTracks = async (accessToken, limit = 5) => {
    const savedTracksUrl = `https://api.spotify.com/v1/me/tracks?limit=${limit}`;
    const response = await fetch(savedTracksUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to get Spotify saved tracks');
    }
    // save response as json
    const tracksData = await response.json();
    
    // return tracks with relevant data
    return tracksData.items.map(item => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists.map(artist => artist.name).join(', '),
        album: item.track.album.name,
        albumImageUrl: item.track.album.images[0]?.url,
        previewUrl: item.track.preview_url,
    }));
};

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks/
export const getSpotifyTopTracks = async (accessToken, limit = 5) => {
    const topTracksUrl = `https://api.spotify.com/v1/me/top/tracks?limit=${limit}`; // can also change tracks to artists to get top artists instead of tracks
    const response = await fetch(topTracksUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to get Spotify top tracks');
    }
    // save response as json
    const tracksData = await response.json();

    // return top tracks with relevant data
    return tracksData.items.map(item => ({
        id: item.id,
        name: item.name,
        artist: item.artists.map(artist => artist.name).join(', '),
        album: item.album.name,
        albumImageUrl: item.album.images[0]?.url,
        previewUrl: item.preview_url,
    }));
};

// Reference: https://developer.spotify.com/documentation/web-api/reference/search
export const searchTracks = async (accessToken, search, genre = '', tag = '', limit = 5) => {
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
    const searchurl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`; // can change type to artist, album, playlist, etc to search for those instead of tracks

    // fetch data from Spotify API
    const response = await fetch(searchurl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to search Spotify tracks');
    }
    // return response as json
    return response.json();
} 