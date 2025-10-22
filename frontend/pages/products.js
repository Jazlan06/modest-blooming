import ProductGrid from "@/components/ProductGrid"

export default function ProductsPage({ products }) {
    return <ProductGrid products={products} />
}

export async function getServerSideProps() {
    try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();

        return {
            props: {
                products: Array.isArray(data) ? data : [],
            },
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            props: {
                products: [],
            },
        };
    }
}