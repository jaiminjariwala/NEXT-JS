'use client';

import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";

// react functional export component (rfce)
function Header() {
    // useUser hook using from clerk, allows to fetch user Data!
    // this hook relies on client-side authentication logic
    const { user } = useUser();

    return (
        <div>
            {user && (
                <h1>
                    {user?.firstName}
                    {`'s`} Space
                </h1>
            )}

            {/* Breadcrumbs */}
            <div>
                {/* SignedOut component will only render it's children, if the user is not currently signed-in */}
                <SignedOut>
                    <SignInButton />    {/* Initiates the user sign-in flow */}
                </SignedOut>

                {/* SignedIn component will only render it's children, if the user is currently signed-in */}
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
        </div>
    )
}

export default Header;
