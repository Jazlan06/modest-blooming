import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';

export default function HomepageCMSAdmin() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [content, setContent] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [formData, setFormData] = useState({
        heroBanners: [],
        brandBanner: null,
        bestSellerBanner: null,
        saleBanner: null,
        announcements: [],
        featuredProductIds: [],
        seo: {
            title: '',
            description: '',
            keywords: '',
        },
    });

    // Fetch homepage CMS content
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/cms/homepage`);
                setContent(res.data);
                setFormData({
                    heroBanners: res.data.heroBanners || [],
                    brandBanner: res.data.brandBanner || null,
                    bestSellerBanner: res.data.bestSellerBanner || null,
                    saleBanner: res.data.saleBanner || null,
                    announcements: res.data.announcements || [],
                    featuredProductIds: res.data.featuredProductIds || [],
                    seo: res.data.seo || { title: '', description: '', keywords: '' },
                });
                setLoading(false);
            } catch {
                setError('Failed to load homepage CMS content');
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
                const data = await res.json();
                setAllProducts(data || []);
            } catch (err) {
                console.error('Failed to fetch products:', err);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, []);

    // Generic handlers for single object banners
    const handleSingleBannerChange = (bannerKey, field, value) => {
        setFormData({
            ...formData,
            [bannerKey]: {
                ...formData[bannerKey],
                [field]: value,
            },
        });
    };

    const handleSingleBannerImageChange = (bannerKey, file) => {
        setFormData({
            ...formData,
            [bannerKey]: {
                ...formData[bannerKey],
                newImageFile: file,
                imagePreview: URL.createObjectURL(file),
            },
        });
    };

    // Handlers for announcements and product arrays (assuming they have title + description or similar)
    const handleArrayItemChange = (arrayKey, idx, field, value) => {
        const updated = [...formData[arrayKey]];
        updated[idx] = { ...updated[idx], [field]: value };
        setFormData({ ...formData, [arrayKey]: updated });
    };

    const addArrayItem = (arrayKey, defaultObj) => {
        setFormData({
            ...formData,
            [arrayKey]: [...formData[arrayKey], defaultObj],
        });
    };

    const removeArrayItem = (arrayKey, idx) => {
        const updated = [...formData[arrayKey]];
        updated.splice(idx, 1);
        setFormData({ ...formData, [arrayKey]: updated });
    };

    // SEO change handler
    const handleSEOChange = (field, value) => {
        setFormData({
            ...formData,
            seo: {
                ...formData.seo,
                [field]: value,
            },
        });
    };

    // Hero banner handlers (already in your code)
    const handleBannerChange = (idx, field, value) => {
        const updated = [...formData.heroBanners];
        updated[idx] = { ...updated[idx], [field]: value };
        setFormData({ ...formData, heroBanners: updated });
    };

    const handleHeroBannerImageChange = (idx, file) => {
        const updated = [...formData.heroBanners];
        updated[idx] = { ...updated[idx], newImageFile: file, imagePreview: URL.createObjectURL(file) };
        setFormData({ ...formData, heroBanners: updated });
    };

    const addHeroBanner = () => {
        setFormData({
            ...formData,
            heroBanners: [
                ...formData.heroBanners,
                { title: '', subtitle: '', buttonText: '', buttonLink: '', textColor: '#000', image: '', imagePreview: '' },
            ],
        });
    };

    const removeHeroBanner = (idx) => {
        const updated = [...formData.heroBanners];
        updated.splice(idx, 1);
        setFormData({ ...formData, heroBanners: updated });
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const submitData = new FormData();

            // --- Hero Banners ---
            formData.heroBanners.forEach((banner, index) => {
                if (banner.newImageFile instanceof File) {
                    submitData.append(`heroBanners[${index}]`, banner.newImageFile);
                }
            });

            const heroMeta = formData.heroBanners.map(({ newImageFile, imagePreview, ...rest }) => rest);
            heroMeta.forEach(meta => {
                submitData.append('heroBannerMeta', JSON.stringify(meta));
            });

            // --- Brand / Best Seller / Sale Banners ---
            ['brandBanner', 'bestSellerBanner', 'saleBanner'].forEach((key) => {
                const banner = formData[key];
                if (banner?.newImageFile instanceof File) {
                    submitData.append(key, banner.newImageFile);
                }

                if (banner) {
                    const meta = { ...banner };
                    delete meta.newImageFile;
                    delete meta.imagePreview;

                    if (!meta.textColor || meta.textColor.trim() === '') {
                        meta.textColor = '#000000';
                    }

                    submitData.append(`${key}Meta`, JSON.stringify(meta));
                }
            });

            // --- Announcements ---
            formData.announcements?.forEach((item) => {
                const { imagePreview, newImageFile, ...meta } = item;

                submitData.append('announcementMeta', JSON.stringify(meta));

                if (newImageFile instanceof File) {
                    submitData.append('announcementImages', newImageFile);
                }
            });

            // --- SEO ---
            submitData.append('seo', JSON.stringify(formData.seo));

            // --- Product Arrays as IDs ---
            submitData.append('featuredProductIds', JSON.stringify(formData.featuredProductIds));

            // --- Send request with auth token ---
            const token = localStorage.getItem("token");

            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/cms/homepage`,
                submitData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            alert('Homepage CMS updated successfully!');
        } catch (err) {
            console.error('Submit error:', err);
            alert('Failed to update homepage CMS: ' + (err.response?.data?.message || err.message));
        }
    };


    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

    return (
        <>
            <Navbar />
            <main className='pt-[3rem] sm:pt-[7rem] md:pt-[10rem]'>
                <div className="max-w-6xl mx-auto p-8 bg-white shadow-lg rounded-lg my-8">
                    <h1 className="text-4xl font-bold mb-8 text-center">Homepage CMS</h1>

                    <form onSubmit={handleSubmit} className="space-y-12">

                        {/* Hero Banners */}
                        <section>
                            <h2 className="text-3xl font-semibold mb-6">Hero Banners</h2>
                            {formData.heroBanners.map((banner, idx) => (
                                <div key={idx} className="border rounded-lg p-6 mb-6 shadow-sm relative bg-gray-50">
                                    <button
                                        type="button"
                                        onClick={() => removeHeroBanner(idx)}
                                        className="absolute top-4 right-4 text-red-600 font-bold hover:text-red-800"
                                        title="Remove Banner"
                                    >
                                        &times;
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block mb-2 font-semibold">Title:</label>
                                            <input
                                                type="text"
                                                value={banner.title}
                                                onChange={(e) => handleBannerChange(idx, 'title', e.target.value)}
                                                className="w-full border rounded px-3 py-2"
                                                placeholder="Banner Title"
                                                required
                                            />
                                            <label className="block mt-4 mb-2 font-semibold">Subtitle:</label>
                                            <input
                                                type="text"
                                                value={banner.subtitle}
                                                onChange={(e) => handleBannerChange(idx, 'subtitle', e.target.value)}
                                                className="w-full border rounded px-3 py-2"
                                                placeholder="Banner Subtitle"
                                            />
                                            <label className="block mt-4 mb-2 font-semibold">Button Text:</label>
                                            <input
                                                type="text"
                                                value={banner.buttonText}
                                                onChange={(e) => handleBannerChange(idx, 'buttonText', e.target.value)}
                                                className="w-full border rounded px-3 py-2"
                                                placeholder="Button Text"
                                            />
                                            <label className="block mt-4 mb-2 font-semibold">Button Link:</label>
                                            <input
                                                type="url"
                                                value={banner.buttonLink}
                                                onChange={(e) => handleBannerChange(idx, 'buttonLink', e.target.value)}
                                                className="w-full border rounded px-3 py-2"
                                                placeholder="https://example.com"
                                            />
                                            <label className="block mt-4 mb-2 font-semibold">Text Color:</label>
                                            <input
                                                type="color"
                                                value={banner.textColor || '#000000'}
                                                onChange={(e) => handleBannerChange(idx, 'textColor', e.target.value)}
                                                className="w-16 h-10 p-0 border rounded cursor-pointer"
                                                title="Select Text Color"
                                            />
                                            <label className="block mt-6 mb-2 font-semibold">Image:</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => e.target.files[0] && handleHeroBannerImageChange(idx, e.target.files[0])}
                                            />
                                        </div>
                                        <div className="flex flex-col items-center justify-center bg-white border rounded p-4 shadow-inner">
                                            <p className="font-semibold mb-2">Preview</p>
                                            {banner.imagePreview ? (
                                                <img
                                                    src={banner.imagePreview}
                                                    alt={`Preview Hero Banner ${idx + 1}`}
                                                    className="max-w-full max-h-48 object-contain rounded"
                                                />
                                            ) : banner.image ? (
                                                <img
                                                    src={banner.image}
                                                    alt={`Hero Banner ${idx + 1}`}
                                                    className="max-w-full max-h-48 object-contain rounded"
                                                />
                                            ) : (
                                                <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded text-gray-400">
                                                    No Image
                                                </div>
                                            )}
                                            <h3
                                                className="mt-4 text-xl font-bold"
                                                style={{ color: banner.textColor || '#000' }}
                                            >
                                                {banner.title || 'Title'}
                                            </h3>
                                            <p
                                                className="text-md"
                                                style={{ color: banner.textColor || '#000' }}
                                            >
                                                {banner.subtitle || 'Subtitle'}
                                            </p>
                                            {banner.buttonText && (
                                                <a
                                                    href={banner.buttonLink || '#'}
                                                    className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                                >
                                                    {banner.buttonText}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addHeroBanner}
                                className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                + Add Hero Banner
                            </button>
                        </section>

                        {/* Best Seller Banner */}
                        <section>
                            <h2 className="text-3xl font-semibold mb-6 mt-12">Best Seller Banner</h2>
                            {formData.bestSellerBanner ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start bg-gray-50 p-6 rounded shadow-sm">
                                    <div>
                                        <label className="block mb-2 font-semibold">Title:</label>
                                        <input
                                            type="text"
                                            value={formData.bestSellerBanner.title || ''}
                                            onChange={(e) => handleSingleBannerChange('bestSellerBanner', 'title', e.target.value)}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="Best Seller Banner Title"
                                        />
                                        <label className="block mt-4 mb-2 font-semibold">Button Text:</label>
                                        <input
                                            type="text"
                                            value={formData.bestSellerBanner.buttonText || ''}
                                            onChange={(e) => handleSingleBannerChange('bestSellerBanner', 'buttonText', e.target.value)}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="Button Text"
                                        />
                                        <label className="block mt-4 mb-2 font-semibold">Button Link:</label>
                                        <input
                                            type="url"
                                            value={formData.bestSellerBanner.buttonLink || ''}
                                            onChange={(e) => handleSingleBannerChange('bestSellerBanner', 'buttonLink', e.target.value)}
                                            className="w-full border rounded px-3 py-2"
                                            placeholder="https://example.com"
                                        />
                                        <label className="block mt-4 mb-2 font-semibold">Text Color:</label>
                                        <input
                                            type="color"
                                            value={formData.bestSellerBanner.textColor || '#000000'}
                                            onChange={(e) => handleSingleBannerChange('bestSellerBanner', 'textColor', e.target.value)}
                                            className="w-16 h-10 p-0 border rounded cursor-pointer"
                                            title="Select Text Color"
                                        />
                                        <label className="block mt-6 mb-2 font-semibold">Image:</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files[0] && handleSingleBannerImageChange('bestSellerBanner', e.target.files[0])}
                                        />
                                    </div>
                                    <div className="flex flex-col items-center justify-center bg-white border rounded p-4 shadow-inner">
                                        <p className="font-semibold mb-2">Preview</p>
                                        {formData.bestSellerBanner.imagePreview ? (
                                            <img
                                                src={formData.bestSellerBanner.imagePreview}
                                                alt="Best Seller Banner Preview"
                                                className="max-w-full max-h-48 object-contain rounded"
                                            />
                                        ) : formData.bestSellerBanner.image ? (
                                            <img
                                                src={formData.bestSellerBanner.image}
                                                alt="Best Seller Banner"
                                                className="max-w-full max-h-48 object-contain rounded"
                                            />
                                        ) : (
                                            <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                        <h3
                                            className="mt-4 text-xl font-bold"
                                            style={{ color: formData.bestSellerBanner.textColor || '#000' }}
                                        >
                                            {formData.bestSellerBanner.title || 'Title'}
                                        </h3>
                                        {formData.bestSellerBanner.buttonText && (
                                            <a
                                                href={formData.bestSellerBanner.buttonLink || '#'}
                                                className="mt-3 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                            >
                                                {formData.bestSellerBanner.buttonText}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p>No Best Seller banner data available.</p>
                            )}
                        </section>

                        {/* Sale Banner */}
                        <section>
                            <h2 className="text-3xl font-semibold mb-6 mt-12">Sale Banner</h2>

                            {formData.saleBanner ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start bg-gray-50 p-6 rounded shadow-sm">
                                        <div>
                                            {/* Title */}
                                            <label className="block mb-2 font-semibold">Title:</label>
                                            <input
                                                type="text"
                                                value={formData.saleBanner.title || ''}
                                                onChange={(e) => handleSingleBannerChange('saleBanner', 'title', e.target.value)}
                                                className="w-full border rounded px-3 py-2"
                                                placeholder="Sale Banner Title"
                                            />

                                            {/* Button Text */}
                                            <label className="block mt-4 mb-2 font-semibold">Button Text:</label>
                                            <input
                                                type="text"
                                                value={formData.saleBanner.buttonText || ''}
                                                onChange={(e) => handleSingleBannerChange('saleBanner', 'buttonText', e.target.value)}
                                                className="w-full border rounded px-3 py-2"
                                                placeholder="Button Text"
                                            />

                                            {/* Button Link */}
                                            <label className="block mt-4 mb-2 font-semibold">Button Link:</label>
                                            <input
                                                type="url"
                                                value={formData.saleBanner.buttonLink || ''}
                                                onChange={(e) => handleSingleBannerChange('saleBanner', 'buttonLink', e.target.value)}
                                                className="w-full border rounded px-3 py-2"
                                                placeholder="https://example.com"
                                            />

                                            {/* Text Color */}
                                            <label className="block mt-4 mb-2 font-semibold">Text Color:</label>
                                            <input
                                                type="color"
                                                value={formData.saleBanner.textColor || '#000000'}
                                                onChange={(e) => handleSingleBannerChange('saleBanner', 'textColor', e.target.value)}
                                                className="w-16 h-10 p-0 border rounded cursor-pointer"
                                                title="Select Text Color"
                                            />

                                            {/* Image Upload */}
                                            <label className="block mt-6 mb-2 font-semibold">Image:</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    e.target.files[0] && handleSingleBannerImageChange('saleBanner', e.target.files[0])
                                                }
                                            />

                                            {/* isActive Toggle */}
                                            <div className="mt-6">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.saleBanner.isActive || false}
                                                        onChange={(e) =>
                                                            handleSingleBannerChange('saleBanner', 'isActive', e.target.checked)
                                                        }
                                                        className="w-5 h-5"
                                                    />
                                                    <span className="ml-2 text-sm font-medium">
                                                        {formData.saleBanner.isActive ? 'Active (Visible)' : 'Inactive (Hidden)'}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Preview */}
                                        <div className="flex flex-col items-center justify-center bg-white border rounded p-4 shadow-inner">
                                            <p className="font-semibold mb-2">Preview</p>
                                            {formData.saleBanner.imagePreview ? (
                                                <img
                                                    src={formData.saleBanner.imagePreview}
                                                    alt="Sale Banner Preview"
                                                    className="max-w-full max-h-48 object-contain rounded"
                                                />
                                            ) : formData.saleBanner.image ? (
                                                <img
                                                    src={formData.saleBanner.image}
                                                    alt="Sale Banner"
                                                    className="max-w-full max-h-48 object-contain rounded"
                                                />
                                            ) : (
                                                <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded text-gray-400">
                                                    No Image
                                                </div>
                                            )}
                                            <h3
                                                className="mt-4 text-xl font-bold"
                                                style={{ color: formData.saleBanner.textColor || '#000' }}
                                            >
                                                {formData.saleBanner.title || 'Title'}
                                            </h3>
                                            {formData.saleBanner.buttonText && (
                                                <a
                                                    href={formData.saleBanner.buttonLink || '#'}
                                                    className="mt-3 inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                                                >
                                                    {formData.saleBanner.buttonText}
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <div className="mt-4">
                                        <button
                                            onClick={() => {
                                                const confirmDelete = confirm('Are you sure you want to delete the sale banner?');
                                                if (confirmDelete) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        saleBanner: null,
                                                    }));
                                                }
                                            }}
                                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                        >
                                            Delete Sale Banner
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p>No Sale banner data available.</p>
                            )}
                        </section>


                        {/* Announcements */}
                        <section>
                            <h2 className="text-3xl font-semibold mb-6 mt-12">Announcements</h2>

                            {formData.announcements.length > 0 ? (
                                formData.announcements.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start bg-gray-50 p-6 rounded shadow-sm relative mb-6"
                                    >
                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('announcements', idx)}
                                            className="absolute top-2 right-2 text-red-600 font-bold hover:text-red-800"
                                            title="Remove Announcement"
                                        >
                                            &times;
                                        </button>

                                        {/* --- Input Form --- */}
                                        <div>
                                            <label className="block mb-2 font-semibold">Message:</label>
                                            <textarea
                                                value={item.message || ''}
                                                onChange={(e) =>
                                                    handleArrayItemChange('announcements', idx, 'message', e.target.value)
                                                }
                                                className="w-full border rounded px-3 py-2"
                                                placeholder="Announcement message"
                                                rows={2}
                                            />

                                            <label className="block mt-4 mb-2 font-semibold">Text Color:</label>
                                            <input
                                                type="color"
                                                value={item.textColor || '#000000'}
                                                onChange={(e) =>
                                                    handleArrayItemChange('announcements', idx, 'textColor', e.target.value)
                                                }
                                                className="w-16 h-10 p-0 border rounded cursor-pointer"
                                            />

                                            <label className="block mt-4 mb-2 font-semibold">Background Color:</label>
                                            <input
                                                type="color"
                                                value={item.backgroundColor || '#ffffff'}
                                                onChange={(e) =>
                                                    handleArrayItemChange('announcements', idx, 'backgroundColor', e.target.value)
                                                }
                                                className="w-16 h-10 p-0 border rounded cursor-pointer"
                                            />

                                            <label className="block mt-4 mb-2 font-semibold">Animation:</label>
                                            <select
                                                value={item.animation || ''}
                                                onChange={(e) =>
                                                    handleArrayItemChange('announcements', idx, 'animation', e.target.value)
                                                }
                                                className="w-full border rounded px-3 py-2"
                                            >
                                                <option value="">None</option>
                                                <option value="animate-fade">Fade In</option>
                                                <option value="animate-bounce">Bounce</option>
                                                <option value="animate-slide">Slide</option>
                                            </select>

                                            <label className="block mt-4 mb-2 font-semibold">Image:</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const updated = [...formData.announcements];
                                                        updated[idx] = {
                                                            ...updated[idx],
                                                            newImageFile: file,
                                                            imagePreview: URL.createObjectURL(file),
                                                        };
                                                        setFormData({ ...formData, announcements: updated });
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/* --- Live Preview --- */}
                                        <div
                                            className={`border rounded p-4 text-center shadow-inner transition-all duration-300 ${item.animation}`}
                                            style={{
                                                backgroundColor: item.backgroundColor || '#ffffff',
                                                color: item.textColor || '#000000',
                                            }}
                                        >
                                            {item.imagePreview || item.image ? (
                                                <img
                                                    src={item.imagePreview || item.image}
                                                    alt="Preview"
                                                    className="mx-auto mb-3 max-h-24 object-contain"
                                                />
                                            ) : (
                                                <div className="h-24 mb-3 bg-gray-200 flex items-center justify-center rounded text-sm text-gray-400">
                                                    No Image
                                                </div>
                                            )}
                                            <p>{item.message || 'Live preview of the announcement message'}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No announcements available.</p>
                            )}

                            {/* Add Announcement Button */}
                            <button
                                type="button"
                                onClick={() =>
                                    addArrayItem('announcements', {
                                        message: '',
                                        textColor: '#000000',
                                        backgroundColor: '#ffffff',
                                        animation: '',
                                        image: '',
                                        imagePreview: '',
                                    })
                                }
                                className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                + Add Announcement
                            </button>
                        </section>

                        {/* Featured Products */}
                        <section>
                            <h2 className="text-3xl font-semibold mb-6 mt-12">Featured Products</h2>

                            {loadingProducts ? (
                                <p>Loading products...</p>
                            ) : (
                                <>
                                    {formData.featuredProductIds?.length > 0 ? (
                                        <ul className="mb-4">
                                            {formData.featuredProductIds.map((id, idx) => {
                                                const product = allProducts.find(p => p._id === id);
                                                return (
                                                    <li
                                                        key={id}
                                                        className="flex justify-between items-center bg-gray-100 p-3 rounded mb-2"
                                                    >
                                                        <span>
                                                            {product?.name || 'Unknown Product'} ({product?.price ? `₹${product.price}` : 'N/A'})
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newList = [...formData.featuredProductIds];
                                                                newList.splice(idx, 1);
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    featuredProductIds: newList
                                                                }));
                                                            }}
                                                            className="text-red-600 font-bold hover:text-red-800"
                                                            title="Remove"
                                                        >
                                                            &times;
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="mb-4">No featured products selected.</p>
                                    )}

                                    {/* Product Selector */}
                                    <select
                                        onChange={(e) => {
                                            const selectedId = e.target.value;
                                            if (
                                                selectedId &&
                                                !formData.featuredProductIds.includes(selectedId) &&
                                                formData.featuredProductIds.length < 4
                                            ) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    featuredProductIds: [...prev.featuredProductIds, selectedId]
                                                }));
                                            }
                                            e.target.value = ''; // reset dropdown
                                        }}
                                        className="w-full border rounded px-3 py-2 mb-4"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>
                                            Select a product to feature
                                        </option>
                                        {allProducts
                                            .filter(p => !formData.featuredProductIds?.includes(p._id))
                                            .map(product => (
                                                <option key={product._id} value={product._id}>
                                                    {product.name} – ₹{product.price}
                                                </option>
                                            ))}
                                    </select>

                                    {formData.featuredProductIds.length >= 4 && (
                                        <p className="text-sm text-red-600 mb-4">Maximum 4 featured products allowed.</p>
                                    )}
                                </>
                            )}
                        </section>


                        <div className="mt-12 flex justify-end">
                            <button
                                type="submit"
                                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div >
            </main>
        </>
    );
}