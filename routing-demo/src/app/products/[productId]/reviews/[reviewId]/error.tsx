"use client"

// this component acts as an error boundary around our page.tsx file in the same folder
// it is important to note that ERROR BOUNDARIES MUST BE CLIENT COMPONENTS
export default function ErrorBoundary({ error } : {error: Error}) {
  return <div>{error.message}</div>
}

// error.tsx:
// it automatically wraps route segments and their nested children in a React Error Boundary
// You can create custom error UIs for specific segments using the file system hierarchy
// it isolates errors to affected segments while keeping the rest of your app functional
// it enables you to attempt to recover from an error without requiring a full page reload