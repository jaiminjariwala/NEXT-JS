// to export "ids", we'll "destructure" the "params" prop

export default function ReviewDetail({
  params,
}: {
  params: {
    productId: string;
    reviewId: string;
  };
}) {
  return (
    <h1>
      Review {params.reviewId} for product {params.productId}
    </h1>
  );
}
