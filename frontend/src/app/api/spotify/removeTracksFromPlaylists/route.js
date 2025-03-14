// get function that will remove tracks from playlists with the Spotify API
import { removeTracksFromPlaylist } from "@/lib/spotifyAPI";

export async function DELETE(req) {
    const {accessToken, playlistID, tracksToURIs} = await req.json(); // get parameter data from request body (send tracks to convert to URIs)

    // if access token, playlist ID or track URIs are not found, return error
    if (!accessToken || !playlistID || !tracksToURIs || tracksToURIs.length === 0) {
        return new Response(JSON.stringify({error: 'Access token, playlist ID or track URIs not found'}), {status: 400});
    }
    try {
        // convert tracks to array of URIs
        const track_uris = tracksToURIs.map(track => `spotify:track:${track.id}`);

        // remove tracks from the playlist
        const result = await removeTracksFromPlaylist(accessToken, playlistID, track_uris);
        return new Response(JSON.stringify(result), {status: 200});
    } catch (error){
        console.error('Error removing tracks from playlist: ', error);
        return new Response(JSON.stringify({error: 'Failed to remove tracks from playlist'}), {status: 500});
    }
}