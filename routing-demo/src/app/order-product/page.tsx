"use client";

import { useRouter } from "next/navigation"; // useRouter hook is used to programmatically navigate between routes in a client component.

export default function OrderProductPage() {
  const router = useRouter();
  const handleClick = () => {
    console.log("Order placed!");
    // after the order is placed, you want to redirect the user to the home page, for that we will use useRouter hook from 'next/navigation'

    // use push method to handle navigation
    router.push("/");
  };
  return (
    <>
      <h1>Order Product</h1>
      <button onClick={handleClick}>Place order</button>
    </>
  );
}
