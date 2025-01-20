/* 
This component wraps client—side logic (Header) with any children passed to it.
It acts as a bridge between server-rendered layouts and client-side logic.
We can add more Client-Only Components inside this file, without affecting the RootLayout (layout.tsx file).
*/



'use Client';   // Ensures that ClientLayout is a client component.

import Header from './Header';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header/>   {/* The Header component is rendered at the top, ensuring it's present across all pages; followed by the "content" passed as "children" below. */}
            {children}
        </>
    )
}