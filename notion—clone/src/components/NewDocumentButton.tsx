/*
    This is a CLIENT SIDE REACT COMPONENT, for triggering the creation of new Document!
    
    Upon clicking the NewDocumentButton, it calls the "createNewDocument" server action, navigates the user to the newly created document's page and displays a loading state during the process!

    => About useTransition Hook: This is a React Hook to manage "Asynchronous Transitions". It ensures a smooth user experience during state updates, such as page navigation or API calls.

    => About useRouter Hook: It provides acces to the router object. This object gives us the ability to programmatically navigate between routes.  
*/


'use client';

import { useTransition } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createNewDocument } from "../../actions/actions";

export default function NewDocumentButton() {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleCreateNewDocument = () => {
        startTransition(async () => {
            const result = await createNewDocument()    // call the server action
            router.push(`/doc/${result.docId}`)     // navigate user to the new document's page using its "docId".
        })
        // "router.push" is used to programmatically navigate to a specific page, in this case, the newly created document(createNewDocument())
    }
    return (
        // disabled attribute is used to disable the button while a transition isPending i.e is in progress!
        <Button onClick={handleCreateNewDocument} disabled={!isPending}>
            {isPending ? "Creating..." : "New Document"}
        </Button>
    )
}