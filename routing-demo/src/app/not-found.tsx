// the filename has to be "not-found" in order to create custom 404 Error page!
export default function NotFound() {
    return (
        <div>
            <h2>Error 404: Page Not Found</h2>
            <p>Could not find requested resource!</p>
        </div>
    )
}