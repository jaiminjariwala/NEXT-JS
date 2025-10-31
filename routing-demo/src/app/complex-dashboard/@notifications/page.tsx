import { Card } from "@/components/card"

export default function Notifications() {
  return <Card>Notifications</Card> 
  // here the text Notifications becomes a special prop called children and the card component receives that children in card.tsx file.
  // so it behaves like: <Card children="Notifications" />

}