// Private Folders: A way to tell Next.js, "Hey, this folder is just for internal stuff. Don't include it in the routing system."
// The folder and all its subfolders are excluded from routing."
// Add an underscrore (_) at the beginning of the folder name to make it private.

export default function PrivateRoute() {
    return <h1>You cannot view this in the browser.</h1>
}


// Private folder are super useful for bunch of things:
// Keeping your UI logic separate from routing logic,
// Having a consistent way to organize internal files in your project.
// Making it easier to group related files in your code editor
// Avoiding potential naming conflicts with future Next.js file naming conventions.

// TIP: If you actually want an underscore in your URL path, use %5F (URL encoded version of underscore) in the folder name.