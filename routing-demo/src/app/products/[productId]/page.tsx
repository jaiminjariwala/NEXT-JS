// every page in the "app" router receives route parameters as a prop!

// the "params" object contains route parameters as "key:value" pairs
// we need to specify the "type" of the "params" object!
// "params" is an object with a key called "productId" of type "string"
export default function ProductDetails({
    params,
}: {
    params: { productId: string };
}) {
    return <h1>Details about Product {params.productId}</h1>;
}
