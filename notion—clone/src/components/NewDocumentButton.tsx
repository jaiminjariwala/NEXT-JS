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
            const result = await createNewDocument()
            router.push(`/doc/${result.docId}`)
        })
    }
    return (
        <Button onClick={handleCreateNewDocument} disabled={!isPending}>
            {isPending ? "Creating..." : "New Document"}
        </Button>
    )
}