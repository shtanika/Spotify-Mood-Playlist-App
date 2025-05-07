export interface User {
    spotify_id: string;
    email?: string;
    display_name?: string;
    profile_image?: string;
}

export interface CreateUserRequest {
    spotify_id: string;
    email?: string;
    display_name?: string;
    profile_image?: string;
}

export interface CreateUserResponse {
    message: string;
    user: User;
}

export interface GetUserResponse {
    user: User;
}

// API Endpoints
export interface BackendAPI {
    createUser(data: CreateUserRequest): Promise<CreateUserResponse>;
    getUserBySpotifyId(spotifyId: string): Promise<GetUserResponse>;
}