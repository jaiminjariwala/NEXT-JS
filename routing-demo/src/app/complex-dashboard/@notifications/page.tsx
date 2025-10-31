import { Card } from "@/components/card";
import Link from "next/link";

export default function Notifications() {
  return (
    <Card>
      <div>Notifications</div>
      <div>
        <Link href="/complex-dashboard/archived">Archived</Link>
      </div>
    </Card>
  )
  // here the text Notifications becomes a special prop called children and the card component receives that children in card.tsx file.
  // so it behaves like: <Card children="Notifications" />
}
