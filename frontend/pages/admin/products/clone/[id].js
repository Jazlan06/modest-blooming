import { useEffect, useState } from 'react';
import axios from '@/utils/axios';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

const CloneProduct = () => {
  const [product, setProduct] = useState(null);
  const [colorName, setColorName] = useState('');
  const [colorCode, setColorCode] = useState('#000000');  // Default to black
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [quantity, setQuantity] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = router.query; // Get product ID from URL

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
          setProduct(res.data);
        } catch (err) {
          setError('Failed to load product data');
        }
      };

      fetchProduct();
    }
  }, [id]);

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleColorChange = (e) => {
    setColorCode(e.target.value);  // Set the selected color code
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!colorName || !colorCode) {
      setError('Color name and color code are required!');
      return;
    }

    // Prepare form data for cloning the product
    const formData = new FormData();
    formData.append('colorName', colorName);
    formData.append('colorCode', colorCode);
    formData.append('price', price);
    formData.append('discountPrice', discountPrice);
    formData.append('weight', weight);
    formData.append('quantity', quantity);

    // Add images to form data
    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}/clone`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Navigate back to product list or show success
      alert('Product variant cloned successfully!');
      router.push('/admin/products');
    } catch (err) {
      setError('Error cloning the product variant');
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md pt-[7rem] md:pt-[11rem]">
        <h1 className="text-3xl font-heading text-primary mb-6">Clone Product as Variant</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {product ? (
          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            {/* Original Product */}
            <div>
              <label className="block mb-1 font-medium">Original Product:</label>
              <p className="text-lg">{product.name}</p>
            </div>

            {/* Color Name */}
            <div>
              <label className="block mb-1 font-medium">Color Name *</label>
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                required
                placeholder="e.g. Red"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block mb-1 font-medium">Select Color *</label>
              <input
                type="color"
                value={colorCode}
                onChange={handleColorChange}
                className="w-full h-10 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block mb-1 font-medium">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Optional"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Discount Price */}
            <div>
              <label className="block mb-1 font-medium">Discount Price (₹)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="Optional"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block mb-1 font-medium">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Optional"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block mb-1 font-medium">Quantity *</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Required"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Upload Variant Images */}
            <div>
              <label className="block mb-1 font-medium">Upload Variant Images</label>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition"
              >
                Clone Product Variant
              </button>
            </div>
          </form>
        ) : (
          <p>Loading product data...</p>
        )}
      </div>
    </>
  );
};

export default CloneProduct;