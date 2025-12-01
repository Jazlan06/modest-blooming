import ProductDetail from "@/components/ProductDetail";
import SEO from "@/components/SEO";

export default function ProductPage({ product }) {
    const seoTitle = product.name + " | My Shop";
    const seoDescription = product.shortDescription || product.description || "Check out this amazing product!";
    const seoUrl = `https://www.myshop.com/product/${product.slug}`;
    const seoImage = product.images?.[0]?.url || product.colors?.[0]?.images?.[0] || null;
    return (
        <>
            <SEO
                title={seoTitle}
                description={seoDescription}
                url={seoUrl}
                image={seoImage}
            />
            <ProductDetail product={product} />
        </>
    );
}

export async function getServerSideProps(context) {
    const { slug } = context.params;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/slug/${slug}`);
    if (!res.ok) {
        return { notFound: true };
    }

    const product = await res.json();

    return {
        props: { product },
    };
}