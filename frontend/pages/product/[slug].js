import ProductDetail from "@/components/ProductDetail"

export default function ProductPage({ product }) {
    return <ProductDetail product={product} />
}

export async function getServerSideProps(context) {
    const { slug } = context.params

    const res = await fetch(`http://localhost:5000/api/products`) // fetch all
    const products = await res.json()

    const product = products.find((p) => p.slug === slug || p._id === slug)

    if (!product) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            product,
        },
    }
}
