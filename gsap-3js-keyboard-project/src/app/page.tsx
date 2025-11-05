import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import { components } from "@/slices";

// main react component
export default async function Page() {
  // shows the webpage UI
  const client = createClient();
  const page = await client.getSingle("homepage").catch(() => notFound());

  // returns JSX
  return <SliceZone slices={page.data.slices} components={components} />;
}

// generateMetadata is a special nextjs hook which nextjs automatically detects, like generateStaticParams
export async function generateMetadata(): Promise<Metadata> {
  // this is a Server-Side SEO function
  // this sets the title & preview image when someone shares the link
  const client = createClient();
  const page = await client.getSingle("homepage").catch(() => notFound());

  // returns Metadata object
  return {
    title: page.data.meta_title,  // browser tab title
    description: page.data.meta_description,  // meta description for SEO
    openGraph: {
      images: [{ url: asImageSrc(page.data.meta_image) ?? "" }],  // image for link previews
    },
  };
}



/*
  In typescript, there are 2 worlds
  1. Type System (compile time)
    - exists only when writing and compiling
    - used to check correctness
    - types disapppear after build 
    - dev only
  2. Javascript code (runtime)
    - exists when app runs in browser / server
    - executes logic and produces results
    - code stays and runs
    - user sees the result

  Ex.
    type User = {
      name: string;
    };
    This only exists in TypeScript (development).
    It vanishes in compiled JS — not sent to browser or server.
    There is no User variable at runtime.
    It's just a rule for the developer & compiler.


*/