import { Metadata } from "next";

// generateMetadata is an asynchronous function that will return a promise which resolves to a metadata object.
export const generateMetadata = async ({ params} : Props): Promise<Metadata> => { // this promise resolves to a Metadata object that is... it returns Metadata
  const id = (await params).productId;
  const title = await new Promise( (resolve) => {
    setTimeout(() => {
      resolve(`iPhone ${id}`)
    }, 2000)
  })
  return {
    title: `Product ${title}`
  } 
}

type Props = {
  params : Promise<{ productId: string}>  // this line of code expects params to be a Promise that resolves to an object with a productId string
}


// every page in the "app" router receives route parameters as a prop!

// the "params" object contains route parameters as "key:value" pairs
// we need to specify the "type" of the "params" object!
// "params" is an object with a key called "productId" of type "string"

export default async function ProductDetails({ params } : Props) {
  const productId = (await params).productId;
  return <h1>Details about product {productId}</h1>;
}

// Promise: something that will finish in the future
// when it finish, it gives and object that looks like this: { productId: 'some-string
// await tells Javascript, pause this function until the Promise is resolved