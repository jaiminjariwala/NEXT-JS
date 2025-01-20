/* 
    => Even though the below function looks like a normal REACT FUNCTIONAL COMPONENT, it is being rendered as something known as A SERVER SIDE COMPONENT

    => There are 2 Enviroments where our application code can be rendered, the CLIENT COMPONENT and the SERVER COMPONENT. By default, all the components created in NEXT.js within the src/app folder are REACT SERVER COMPONENTS. This means that NEXT.js leverages SERVER SIDE RENDERING, to enhance the initial page loading speed resulting in improved SEO and UX.

    => In-Case if we want to turn the Default SERVER SIDE COMPONENT RENDERING into the CLIENT SIDE, we need to add the "use client" directive to the top of the page.
*/

import { Button } from "@/components/ui/button";

// "Home" component is passed as "children" to "RootLayout"
// "RootLayout" passes "Home" as "children" to "ClientLayout"
// "ClientLayout" renders... the "Header" at the top and the content of "Home" below it.
export default function Home() {
    return (
        <main className="">
            <h1>Let's build an API Productivity app</h1>
            <Button>Click Me</Button>
        </main>
    );
}
