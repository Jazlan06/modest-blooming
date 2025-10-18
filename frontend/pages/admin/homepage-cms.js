// pages/admin/homepage-cms.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function HomepageCMSAdmin() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [content, setContent] = useState(null);
    const [formData, setFormData] = useState({
        heroBanners: [],
        brandBanner: null,
        // Add other fields as needed
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/cms/homepage`);
                setContent(res.data);

                setFormData({
                    heroBanners: res.data.heroBanners || [],
                    brandBanner: res.data.brandBanner || null,
                    // Populate other fields similarly
                });
                setLoading(false);
            } catch (err) {
                setError('Failed to load homepage CMS content');
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    // Handle input changes for text fields
    const handleBannerChange = (idx, field, value) => {
        const updated = [...formData.heroBanners];
        updated[idx] = { ...updated[idx], [field]: value };
        setFormData({ ...formData, heroBanners: updated });
    };

    // Handle brand banner change
    const handleBrandBannerChange = (field, value) => {
        setFormData({ ...formData, brandBanner: { ...formData.brandBanner, [field]: value } });
    };

    // Handle image file input for hero banner
    const handleHeroBannerImageChange = (idx, file) => {
        // Store file temporarily for upload
        const updated = [...formData.heroBanners];
        updated[idx] = { ...updated[idx], newImageFile: file };
        setFormData({ ...formData, heroBanners: updated });
    };

    // Handle brand banner image upload
    const handleBrandBannerImageChange = (file) => {
        setFormData({ ...formData, brandBanner: { ...formData.brandBanner, newImageFile: file } });
    };

    // Add a new hero banner
    const addHeroBanner = () => {
        setFormData({
            ...formData,
            heroBanners: [...formData.heroBanners, { title: '', subtitle: '', buttonText: '', buttonLink: '', textColor: '#fff' }]
        });
    };

    // Remove hero banner
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

            // Handle hero banners images and metadata
            formData.heroBanners.forEach((banner, idx) => {
                if (banner.newImageFile) {
                    submitData.append('heroBanners', banner.newImageFile);
                }
            });

            // Prepare metadata for hero banners excluding files
            const heroBannerMeta = formData.heroBanners.map(({ newImageFile, ...rest }) => rest);
            submitData.append('heroBannerMeta', JSON.stringify(heroBannerMeta));

            // Brand Banner
            if (formData.brandBanner?.newImageFile) {
                submitData.append('brandBanner', formData.brandBanner.newImageFile);
            }
            const brandMeta = { ...formData.brandBanner };
            delete brandMeta.newImageFile;
            submitData.append('brandBannerMeta', JSON.stringify(brandMeta));

            // TODO: add other fields similarly

            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/cms/homepage`,
                submitData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                }
            );


            alert('Homepage CMS updated successfully!');
        } catch (err) {
            alert('Failed to update homepage CMS: ' + err.message);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Homepage CMS Admin</h1>

            <form onSubmit={handleSubmit} className="space-y-8">

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Hero Banners</h2>

                    {formData.heroBanners.map((banner, idx) => (
                        <div key={idx} className="border p-4 mb-4 rounded">
                            <label className="block mb-1">
                                Title:
                                <input
                                    type="text"
                                    value={banner.title}
                                    onChange={e => handleBannerChange(idx, 'title', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </label>

                            <label className="block mb-1">
                                Subtitle:
                                <input
                                    type="text"
                                    value={banner.subtitle}
                                    onChange={e => handleBannerChange(idx, 'subtitle', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </label>

                            <label className="block mb-1">
                                Button Text:
                                <input
                                    type="text"
                                    value={banner.buttonText}
                                    onChange={e => handleBannerChange(idx, 'buttonText', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </label>

                            <label className="block mb-1">
                                Button Link:
                                <input
                                    type="text"
                                    value={banner.buttonLink}
                                    onChange={e => handleBannerChange(idx, 'buttonLink', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </label>

                            <label className="block mb-1">
                                Text Color:
                                <input
                                    type="color"
                                    value={banner.textColor}
                                    onChange={e => handleBannerChange(idx, 'textColor', e.target.value)}
                                    className="w-16 h-8 p-0 border rounded"
                                />
                            </label>

                            <label className="block mb-1">
                                Image:
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => handleHeroBannerImageChange(idx, e.target.files[0])}
                                />
                            </label>

                            {banner.image && !banner.newImageFile && (
                                <img
                                    src={banner.image}
                                    alt={`Hero Banner ${idx + 1}`}
                                    className="w-48 mt-2 rounded"
                                />
                            )}
                            {banner.newImageFile && (
                                <p className="mt-2 text-green-600">New image selected: {banner.newImageFile.name}</p>
                            )}

                            <button type="button" onClick={() => removeHeroBanner(idx)} className="mt-2 text-red-600 underline">
                                Remove Banner
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addHeroBanner}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Add Hero Banner
                    </button>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Brand Banner</h2>
                    {formData.brandBanner && (
                        <>
                            <label className="block mb-1">
                                Title:
                                <input
                                    type="text"
                                    value={formData.brandBanner.title || ''}
                                    onChange={e => handleBrandBannerChange('title', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </label>

                            <label className="block mb-1">
                                Button Text:
                                <input
                                    type="text"
                                    value={formData.brandBanner.buttonText || ''}
                                    onChange={e => handleBrandBannerChange('buttonText', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </label>

                            <label className="block mb-1">
                                Button Link:
                                <input
                                    type="text"
                                    value={formData.brandBanner.buttonLink || ''}
                                    onChange={e => handleBrandBannerChange('buttonLink', e.target.value)}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </label>

                            <label className="block mb-1">
                                Text Color:
                                <input
                                    type="color"
                                    value={formData.brandBanner.textColor || '#000'}
                                    onChange={e => handleBrandBannerChange('textColor', e.target.value)}
                                    className="w-16 h-8 p-0 border rounded"
                                />
                            </label>

                            <label className="block mb-1">
                                Image:
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => handleBrandBannerImageChange(e.target.files[0])}
                                />
                            </label>

                            {formData.brandBanner.image && !formData.brandBanner.newImageFile && (
                                <img
                                    src={formData.brandBanner.image}
                                    alt="Brand Banner"
                                    className="w-48 mt-2 rounded"
                                />
                            )}

                            {formData.brandBanner.newImageFile && (
                                <p className="mt-2 text-green-600">New image selected: {formData.brandBanner.newImageFile.name}</p>
                            )}
                        </>
                    )}
                </section>

                <button
                    type="submit"
                    className="mt-8 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
}