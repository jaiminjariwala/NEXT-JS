"use client";

import Link from "next/link";
import { use } from "react";  // removed async and await and using use() hook.
// NOTE: USE -> "async/await" for server components and "use() hook" for client components!

// since params and searchParams are promise, we need to mark the function as async
export default function NewsArticle({
  params,
  searchParams,
}: {
  params: Promise<{ articleId: string }>; // params is a promise that resolve to an object containing the dynamic route parameters
  searchParams: Promise<{ lang?: "en" | "es" | "fr" }>; // searchParams is a promise that resolve to an object containing the query parameters
  // this syntax: { lang?: "en" | "es" | "fr" } means the object may have a property lang, and if it exists, its value must be "en" or "es" or "fr"
}) {
  const { articleId } = use(params);
  const { lang = "en" } = use(searchParams);
  return (
    <div>
      <h1>News Article {articleId}</h1>
      <p>Reading in {lang}</p>

      <>
        <Link href={`/articles/${articleId}?lang=en`}>English</Link>
        <br />
        <Link href={`/articles/${articleId}?lang=es`}>Spanish</Link>
        <br />
        <Link href={`/articles/${articleId}?lang=fr`}>French</Link>
        <br />
      </>
    </div>
  );
}



// page.tsx has access to both params and searchParams while layout.tsx has access to only params.
// searchParams are not available in layout components because layouts are meant to be shared across multiple pages, and query parameters can vary between different pages.