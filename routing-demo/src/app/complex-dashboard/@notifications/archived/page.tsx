import { Card } from "@/components/card";
import Link from "next/link";

export default function ArchivedNotifications() {
  return (
    <Card>
      <div>Archived Notifications</div>
      <div>
        <Link href="/complex-dashboard">Default</Link>
      </div>
    </Card>
  )
}

// archived is a regular route folder and not a slot


// UNMATCHED ROUTES CONCEPT:
// When navigating to the archived route, the other slots (children, revenue, users) becomes unmatched.
// While navigating through the UI (like clicking links), Next.js keeps showing whatever was in the unmatched slots before. But when you reload a page, Next.js looks for a "default.tsx" file in each unmatched slot. This file is crtical as it serves as a fallback to render content when the framework cannot retrieve a slot's active state from the current URL. Without that file, if you reload, you'll get a 404 error.