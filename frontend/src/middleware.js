import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';


export async function middleware(req){

    // get token from session, to check if user is authenticated.
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    //console.log("Session inside middleware: ", token);
    
    // if no session exists, redirect to home page
    if (!token){
        console.log("No session found.");
        return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
};


export const config = {
    matcher: [
        '/library',
        '/playlists',
        '/profile',
        '/create'
    ]
};