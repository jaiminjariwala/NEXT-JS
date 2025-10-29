import { Metadata } from "next";

export const metadata: Metadata = {
//   title: "Hello, this is my BLOG", // My Blog replaces %s in the root layout template.
  title : {
    absolute: "Hello, this is my BLOG", // absolute property completely overrides any parent layout title or template.
  }
};
export default async function Blog() {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve("intentional delay")
    }, 2000)
  }) // resolves after 2 seconds
  return <h1>My Blog</h1>;
}
