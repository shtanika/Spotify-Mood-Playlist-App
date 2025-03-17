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


// Reference: https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks/
export const getSpotifyTopArtists = async (accessToken, limit = 5) => {
    const topArtistsUrl = `https://api.spotify.com/v1/me/top/artists?limit=${limit}`; // url to get top artists
    const response = await fetch(topArtistsUrl, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to get Spotify top artists');
    }
    // return response as json
    return response.json();
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
};

// Gets more specific data of a track
// Doesn't contain genre of a track, you will need to use the album's genre or artist's genre
// Reference: https://developer.spotify.com/documentation/web-api/reference/get-track
export const getTrack = async (accessToken, trackID) => {
    const url = `https://api.spotify.com/v1/tracks/${trackID}`; // API endpoint to get a track

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to get Track');
    }

    // Return the response as JSON
    return response.json();
}



// Artist and Album functions
// Possible to get genre of an artist or album

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-an-artist
export const getArtistData = async (accessToken, artistID) => {
    const url = `https://api.spotify.com/v1/artists/${artistID}`; // API endpoint to get an artist

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to get Artist data');
    }

    // Return the response as JSON
    return response.json();
}

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-multiple-artists
// artistIDs is a string of artist IDs separated by commas
export const getMultipleArtistsData = async (accessToken, artistIDs) => {
    const url = `https://api.spotify.com/v1/artists?ids=${artistIDs}`; // API endpoint to get multiple artists

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to get Multiple Artists data');
    }

    // Return the response as JSON
    return response.json();
}

// Get Album data

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-an-album
export const getAlbumData = async (accessToken, albumID) => {
    const url = `https://api.spotify.com/v1/albums/${albumID}`; // API endpoint to get an album

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to get Album data');
    }

    // Return the response as JSON
    return response.json();
}

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-multiple-albums
// albumIDs is a string of album IDs separated by commas
export const getMultipleAlbumsData = async (accessToken, albumIDs) => {
    const url = `https://api.spotify.com/v1/albums?ids=${albumIDs}`; // API endpoint to get multiple albums

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to get Multiple Albums data');
    }

    // Return the response as JSON
    return response.json();
}

// Playlist functions (NEEDS MORE TESTING)
// Deleting a playlist is not supported by the Spotify API, but you can remove tracks from a playlist

// Reference: https://developer.spotify.com/documentation/web-api/reference/create-playlist
// One of the responses will be the playlist ID which can be used to add tracks to the playlist or adding the playlist into the database 
export const createSpotifyPlaylist = async (accessToken, playlist_name, playlist_description = '', publicPlaylist = false) => {
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
export const addTracksToPlaylist = async (accessToken, playlistID, trackURIs) => {
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
export const removeTracksFromPlaylist = async (accessToken, playlistID, trackURIs) => {
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
export const getPlaylist = async (accessToken, playlistID) => {
    const url = `https://api.spotify.com/v1/playlists/${playlistID}`; // API endpoint to get a playlist

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to get Playlist');
    }

    // Return the response as JSON
    return response.json();
};

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-playlists-tracks
// offset is the index of the first track to return, limit is the maximum number of tracks to return
// if limit is not provided, default to 20
export const getPlaylistTracks = async (accessToken, playlistID, offset = 0, limit = 20) => {
    const url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks?offset=${offset}&limit=${limit}`; // API endpoint to get tracks from a playlist

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    // if response is not ok, throw error
    if (!response.ok){
        throw new Error('Failed to get Playlist tracks');
    }

    // return response as json
    return response.json();
};

// Reference: https://developer.spotify.com/documentation/web-api/reference/get-a-list-of-current-users-playlists
export const getUserPlaylists = async (accessToken, offset = 0, limit = 5) => {
    const url = `https://api.spotify.com/v1/me/playlists?offset=${offset}&limit=${limit}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    
    // if response is not ok, throw error
    if(!response.ok){
        throw new Error('Failed to get user playlists');
    }

    // return response as json
    return response.json();

};