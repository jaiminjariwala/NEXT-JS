// to export "ids", we'll "destructure" the "params" prop
import { notFound } from "next/navigation"
import {redirect} from "next/navigation"

function getRandomInt(count: number) {
  return Math.floor(Math.random() * count)
}

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
  const random = getRandomInt(2)  // the function will return either 0 or 1
  if (random === 1) {
    throw new Error("Error loading review details!")  // this will be passed to error.tsx file in the same folder
  }
  return (
    <h1>
      Review {params.reviewId} for product {params.productId}
    </h1>
  );
}
