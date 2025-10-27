import Link from "next/link";

// this is the ROOT ROUTE!
export default function Home() {
  return (
    <>
      <h1>Home Page</h1>
      <Link href={"/blog"}>BLOG</Link><br />
      <Link href={"/products"}>PRODUCTS</Link>
    </>
  );
}
