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

// { params } is an "Object Destructuring Assignment", meaning... we are extracting params directly from the function's argument.
// the part -> ": { params } : { slug: string[] }" is a typescript type annotation, defining... what, type params should be?
// "params" is an object
// inside "params", there is a property called slug, which is an array of strings

// Docs is a react component that receives "props". The "props" contain an object
export default function Docs({
  params, // this "params" has been destructured from props!
}: {
  params: {
    slug: string[]; // slug is an array of string
  };
}) {
  // if params.slug contains exactly 2 elements...
  if (params.slug?.length === 2) {
    return (
      <h1>
        Viewing docs for feature {params.slug[0]} and concept {params.slug[1]}
      </h1>
    );
  }
  // if params.slug contains exactly 1 element...
  else if (params.slug?.length === 1) {
    return <h1>Viewing docs for feature {params.slug[0]}</h1>;
  }
  // if params.slug is empty, meaning there are no parameters in the URL, it defaults to displaying...
  return <h1>Docs Home Page</h1>;
}

// We can even go further and destructure "slug" from "params", which is called as "Nested Destructuring"!
/*
  function Docs(
    { params : { slug } }
  ){
    console.log(slug)
  }
*/
// now we can use "slug" directly instead of "params.slug".
