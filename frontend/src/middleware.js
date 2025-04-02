import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';


export async function middleware(req){
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    //console.log("Session inside middleware: ", token);
    
    // if no session exists, redirect to home page
    if (!token){
        console.log("No session found.");
        return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
};

// need to modify nextAuth for session management first
/* Restrict access to these routes if not signed in doesn't work correctly

Originally, but unable to access pages even when signed in. So empty array for now.
export const config = {
    matcher: [
        '/library',
        '/playlist',
        '/create',
        '/profile'
    ]
};

*/
export const config = {
    matcher: [
        '/library',
        '/playlist',
        '/create',
        '/profile'
    ]
};