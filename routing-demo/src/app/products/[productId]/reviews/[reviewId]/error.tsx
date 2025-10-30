"use client";

import {useRouter} from "next/navigation"
import { startTransition } from "react";

/* 
- startTransition() is a react function that tells react:
- Hey React, this update is not urgent - you can prioritize more important updates first.
- It helps keep your UI smooth and responsive during expensive re-renders or route updates.
- Why we use it?
- Because, when you trigger something heavy (like a route change, big state update or re-render), you don't want your UI to freeze while react works. So you wrap that non-urgent work in startTransition()
*/

// this component acts as an error boundary around our page.tsx file in the same folder
// it is important to note that ERROR BOUNDARIES MUST BE CLIENT COMPONENTS
// apart from the error prop, the ErrorBoundary in error.tsx provides us with another useful prop called the reset function
export default function ErrorBoundary({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter()
  // when the user clicks try again, we call reload function
  const reload = () => {
    startTransition(() => {
      router.refresh()  // refresh the current route( fetches server components again, reloads data from the server )
      reset() // reset the error boundary ( tells NextJS to try rendering the route again, assuming the problem may now be fixed )
    })
  }
  return (
    <div>
      <p>{error.message}</p>
      <button onClick={() => reload()}>Try again</button>
    </div>
  );
}

// error.tsx:
// error.tsx is automatically recognized by Next.js
// it automatically wraps route segments and their nested children in a React Error Boundary
// You can create custom error UIs for specific segments using the file system hierarchy
// it isolates errors to affected segments while keeping the rest of your app functional
// it enables you to attempt to recover from an error without requiring a full page reload
