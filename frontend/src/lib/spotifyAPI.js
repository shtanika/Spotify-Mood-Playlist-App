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