import NextAuth from "next-auth";

// Extending the Session type for access tokens
declare module "next-auth" {
    interface Session {
        accessToken?: string;
    }
    interface Account {
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }
}