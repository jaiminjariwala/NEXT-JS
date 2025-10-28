// to export "ids", we'll "destructure" the "params" prop
import { notFound } from "next/navigation"
import {redirect} from "next/navigation"

export default function ReviewDetail({
  params,
}: {
  params: {
    productId: string;
    reviewId: string;
  };
}) {
  if (!params?.productId || !params?.reviewId) {
    return <p>Loading...</p>;
  }
  if (parseInt(params.reviewId) > 1000 && parseInt(params.reviewId) <= 2000){
    redirect('/products')

  } else if (parseInt(params.reviewId) > 2000) {
    notFound()
  }
  return (
    <h1>
      Review {params.reviewId} for product {params.productId}
    </h1>
  );
}
