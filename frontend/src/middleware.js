import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/react';

export async function middleware(req){
    const session = await getServerSession({ req });
    console.log("Session inside middleware: ", session);
        // if no session exists, redirect to home page
    if (!session){
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
        '/profile
    ]
};

*/
export const config = {
    matcher: []
};