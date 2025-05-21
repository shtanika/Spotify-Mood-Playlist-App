import requests 
from urllib.parse import quote 

# Spotify helper functions

# Get current user's top tracks and artists. Returns 20 tracks and 20 artists
def get_spotify_top_data(access_token):
    if not access_token:
        return None, {'error': 'Access token is not available'}
    headers = {'Authorization': f'Bearer {access_token}'}

    top_tracks_response = requests.get('https://api.spotify.com/v1/me/top/tracks', headers=headers)
    if top_tracks_response.status_code != 200:
        return None, {'error': 'Failed to get top tracks'}
            
    top_artists_response = requests.get('https://api.spotify.com/v1/me/top/artists', headers=headers)
    if top_artists_response.status_code != 200:
        return None, {'error': 'Failed to get top artists'}
            
    top_tracks = top_tracks_response.json()
    top_artists = top_artists_response.json()

    return {
        'top_tracks': top_tracks,
        'top_artists': top_artists
    }, None



# Get spotify ids for each track in a list
def get_spotify_ids_for_tracks(access_token, seed_tracks):
    track_id_list = []
    headers = {'Authorization': f'Bearer {access_token}'}

    for track in seed_tracks:
        track_id = None
        query = quote(track)
        track_response = requests.get(f'https://api.spotify.com/v1/search?q={query}&type=track', headers=headers)

        if track_response.status_code == 200 and 'tracks' in track_response.json():
            if track_response.json()['tracks']['items']:
                track_id = track_response.json()['tracks']['items'][0]['id']

        if track_id:
            track_id_list.append({'track': track, 'spotify_id': track_id})

    return track_id_list

# Get spotify ids for each artist in a list
def get_spotify_ids_for_artists(access_token, seed_artists):
    artists_id_list = []
    headers = {'Authorization': f'Bearer {access_token}'}

    for artist in seed_artists:
        artist_id = None
        query = quote(artist)
        artist_response = requests.get(f'https://api.spotify.com/v1/search?q={query}&type=artist', headers=headers)

        if artist_response.status_code == 200 and 'artists' in artist_response.json():
            if artist_response.json()['artists']['items']:
                artist_id = artist_response.json()['artists']['items'][0]['id']

        if artist_id:
            artists_id_list.append({'artist': artist, 'spotify_id': artist_id})

    return artists_id_list

# function to create a spotify playlist
def create_spotify_playlist(access_token, user_id, playlist_name, playlist_description='', playlist_public=True):
    if not access_token:
        return None, {'error': 'Access token is missing'}, 400
    
    headers = {'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'}
    playlist_data = {
        'name': playlist_name,
        'description': playlist_description,
        'public': playlist_public
    }

    create_spotify_playlist_url = f'https://api.spotify.com/v1/users/{user_id}/playlists'
    response = requests.post(create_spotify_playlist_url, json=playlist_data, headers=headers)

    if response.status_code != 201:
        return None, {'error': 'Failed to create spotify playlist'}, 500
    else:
        return response.json(), None

# function to add tracks to spotify playlist
def add_tracks_spotify_playlist(access_token, playlist_id, track_uris):
    if not access_token:
        return None, {'error': 'Access token is missing'}, 400
    
    headers = {'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'}
    tracks_data = {'uris': track_uris}

    add_tracks_url = f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks'
    response = requests.post(add_tracks_url, json=tracks_data, headers=headers)
    #print(f"add_tracks_spotify_playlist response: {response.status_code}, {response.text}")

    if response.status_code != 201:
        error_message = f"Failed to add tracks to spotify playlist. Status code: {response.status_code}, Response: {response.text}"
        print(error_message)
        return None, {'error': error_message}, response.status_code
    
    return response.json(), None

# function to get the current user's user_id
def get_user_id(access_token):
    if not access_token:
        return None, {'error': 'Access token is missing'}, 400
    
    headers = {'Authorization': f'Bearer {access_token}'}
    spotify_user_url = 'https://api.spotify.com/v1/me'

    response = requests.get(spotify_user_url, headers=headers)

    if response.status_code != 200:
        return None, {'error', 'Failed to get current user'}, 500
    
    user_data = response.json()
    user_id = user_data.get('id')

    if not user_id:
        return None, {'error': 'User ID not found'}, 500
    
    return user_id, None 


# function to get track uri from track id
def get_track_uri(access_token, track_id):
    if not access_token:
        return None, {'error': 'Access token is missing'}, 400
    
    headers = {'Authorization': f'Bearer {access_token}'}
    track_url = f'https://api.spotify.com/v1/tracks/{track_id}'

    response = requests.get(track_url, headers=headers)

    if response.status_code != 200:
        return None, {'error': 'Failed to get track details'}, 500
    
    track_data = response.json()
    track_uri = track_data.get('uri')

    if not track_uri:
        return None, {'error': 'Track URI not found'}, 500
    
    return track_uri, None

# function to get current user's saved tracks, limit, offset optional (can use market as parameter too) 
def get_spotify_saved_tracks(access_token, limit=20, offset=0):
    if not access_token:
        return None, {'error': 'Access token is missing'}, 400
    
    headers = {'Authorization': f'Bearer {access_token}'}
    saved_tracks_url = 'https://api.spotify.com/v1/me/tracks'
    params = {
        'limit': limit,
        'offset': offset
    }

    response = requests.get(saved_tracks_url, headers=headers, params=params)

    if response.status_code == 200:
        return response.json(), None
    else:
        return None, {'error': 'Failed to retrieve saved tracks'}, 500
