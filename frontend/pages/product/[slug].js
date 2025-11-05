import ProductDetail from "@/components/ProductDetail";

export default function ProductPage({ product }) {
    return <ProductDetail product={product} />;
}

export async function getServerSideProps(context) {
    const { slug } = context.params;

    const res = await fetch(`http://localhost:5000/api/products/slug/${slug}`);
    if (!res.ok) {
        return { notFound: true };
    }

    const product = await res.json();

    return {
        props: { product },
    };
}