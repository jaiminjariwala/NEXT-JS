import { Metadata } from "next";

export const metadata: Metadata = {
//   title: "Hello, this is my BLOG", // My Blog replaces %s in the root layout template.
  title : {
    absolute: "Hello, this is my BLOG", // absolute property completely overrides any parent layout title or template.
  }
};
export default function Blog() {
  return <h1>My Blog</h1>;
}
