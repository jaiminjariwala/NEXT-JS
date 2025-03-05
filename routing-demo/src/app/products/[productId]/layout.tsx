export default function ProductDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}  {/* In this case the children prop corresponds to the [productId]'s -> page.tsx */}
      <h2>Featured products</h2>
      {/* Carousel here! */}
    </>
  );
}
