// what makes this file special is that... it maps any URL that contains the "docs segment" in the path

// [...slug] is "catch-all dynamic segment" in Next.js, it allows the route to match multiple path segments

/* 
if we have the below folder structure...

            app/
            ├── docs/
            │    ├── [...slug]/
            │    │    ├── page.tsx

It means that any route under /docs/* will be handled by page.tsx.
*/

/*
Slug is kind of like object (key:value) whose value will be an array/list

Q. How it works?

URL	Matched Route...
/docs   ->	{ slug: [] }
/docs/get-started   ->	{ slug: ['get-started'] }
/docs/tutorials/nextjs  ->  { slug: ['tutorials', 'nextjs'] }
/docs/category/frontend/react   ->	{ slug: ['category', 'frontend', 'react'] }

Q. What is a “Catch-All Segment”?

A catch-all segment (like [...slug]) captures multiple parts of the URL and passes them as an array.
*/
export default function Docs({ params } : {
    params : {
        slug: string[]
    }
}) {
  return <h1>Docs Home Page</h1>;
}
