import Link from "next/link";

// this is the ROOT ROUTE!
export default function Home() {
  return (
    <>
      <h1>Home Page</h1>
      <Link href={"/blog"}>BLOG</Link><br />
      <Link href={"/products"}>PRODUCTS</Link>
      <br />
      <br />
      {/* here breaking-news-123 is a "dynamic route parameter" and lang is the "query parameter" */}
      <Link href="/articles/breaking-news-123?lang=en">Read in English</Link><br/> 
      <Link href="/articles/breaking-news-123?lang=fr">Read in French</Link>
    </>
  );
}
