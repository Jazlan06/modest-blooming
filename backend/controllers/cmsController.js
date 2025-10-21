const HomePageConfig = require('../models/HomePageConfig');
const Product = require('../models/Product');

// --- Helpers ---
const normalizeHexColor = (color) => {
    if (typeof color !== 'string') return '#000000';

    color = color.trim().toLowerCase();

    if (!color.startsWith('#')) color = `#${color}`;

    // Convert 3-digit hex to 6-digit
    if (/^#([0-9a-f]{3})$/.test(color)) {
        color = '#' + [...color.slice(1)].map(ch => ch + ch).join('');
    }

    if (!/^#([0-9a-f]{6})$/.test(color)) {
        return '#000000';
    }

    return color;
};

const parseJsonSafely = (str) => {
    try {
        return JSON.parse(str);
    } catch {
        console.warn('Failed to parse JSON:', str);
        return {};
    }
};

// --- GET: Homepage CMS content ---
const getHomePageContent = async (req, res) => {
    try {
        let config = await HomePageConfig.findOne().lean();

        if (!config) {
            config = await HomePageConfig.create({});
        }

        const featuredProducts = await Product.find({
            _id: { $in: config.featuredProductIds || [] },
        }).lean();

        // Sort by order in featuredProductIds
        const featuredProductsSorted = config.featuredProductIds.map(
            id => featuredProducts.find(p => p._id.toString() === id.toString())
        ).filter(Boolean);

        const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newArrivals = await Product.find({
            createdAt: { $gte: THIRTY_DAYS_AGO }
        })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            ...config,
            featuredProducts: featuredProductsSorted,
            newArrivals,
        });

    } catch (err) {
        console.error('Error fetching homepage CMS:', err);
        res.status(500).json({
            message: 'Failed to fetch homepage content',
            error: err.message,
        });
    }
};

// --- PUT: Update homepage CMS ---
const updateHomePageConfig = async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;

        // Parse SEO field safely
        if (typeof data.seo === 'string') {
            data.seo = parseJsonSafely(data.seo);
        }

        // Parse featuredProductIds
        if (data.featuredProductIds) {
            try {
                const parsed = JSON.parse(data.featuredProductIds);
                data.featuredProductIds = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                console.warn('Failed to parse featuredProductIds. Defaulting to empty array.');
                data.featuredProductIds = [];
            }
        }

        let config = await HomePageConfig.findOne();
        if (!config) {
            config = await HomePageConfig.create({});
        }

        // ✅ Save featuredProductIds
        if (Array.isArray(data.featuredProductIds)) {
            config.featuredProductIds = data.featuredProductIds;
        }

        // ✅ Save SEO
        if (data.seo && typeof data.seo === 'object') {
            config.seo = data.seo;
        }

        // Process hero banners (array)
        if (data.heroBannerMeta) {
            const metas = Array.isArray(data.heroBannerMeta)
                ? data.heroBannerMeta.map(parseJsonSafely)
                : [parseJsonSafely(data.heroBannerMeta)];

            const existingBanners = config.heroBanners || [];

            // 🔁 Step 1: Map files by index like { 0: File, 1: File, ... }
            const heroImageFilesMap = {};
            if (Array.isArray(req.files)) {
                req.files.forEach(file => {
                    const match = file.fieldname.match(/^heroBanners\[(\d+)\]$/);
                    if (match) {
                        const index = parseInt(match[1], 10);
                        heroImageFilesMap[index] = file;
                    }
                });
            }

            // 🔁 Step 2: Process meta and attach correct image
            config.heroBanners = metas.map((meta, i) => {
                const existing = existingBanners[i] || {};
                const file = heroImageFilesMap[i]; // 🧠 Match file by index
                const image = file ? file.path : existing.image;

                return {
                    ...existing,
                    ...meta,
                    image,
                    textColor: normalizeHexColor(meta.textColor || existing.textColor || '#000000'),
                };
            });
        }

        // Helper for single banner merges
        const mergeSingleBanner = (fieldName, metaFieldName, fileFieldName) => {
            if (data[metaFieldName]) {
                const meta = parseJsonSafely(data[metaFieldName]);
                const existing = config[fieldName] || {};
                const file = files?.[fileFieldName]?.[0];

                config[fieldName] = {
                    ...existing,
                    ...meta,
                    ...(file && { image: file.path }),
                    textColor: normalizeHexColor(meta.textColor || existing.textColor || '#000000'),
                };
            }
        };

        mergeSingleBanner('brandBanner', 'brandBannerMeta', 'brandBanner');
        mergeSingleBanner('bestSellerBanner', 'bestSellerBannerMeta', 'bestSellerBanner');
        mergeSingleBanner('saleBanner', 'saleBannerMeta', 'saleBanner');

        // Announcements (array)
        if (data.announcementMeta) {
            const metas = Array.isArray(data.announcementMeta)
                ? data.announcementMeta.map(parseJsonSafely)
                : [parseJsonSafely(data.announcementMeta)];

            const existingAnnouncements = config.announcements || [];

            config.announcements = metas.map((meta, i) => {
                const file = files?.announcementImages?.[i];
                const existing = existingAnnouncements[i] || {};

                return {
                    ...existing,
                    ...meta,
                    ...(file && { image: file.path }),
                    textColor: normalizeHexColor(meta.textColor || existing.textColor || '#000000'),
                    backgroundColor: normalizeHexColor(meta.backgroundColor || existing.backgroundColor || '#ffffff'),
                };
            });
        }

        // Save to DB
        await config.save();

        console.log('✅ Homepage config updated successfully');
        console.log('🔢 Saved featuredProductIds:', config.featuredProductIds);

        res.json({ message: 'Homepage CMS updated successfully' });
    } catch (err) {
        console.error('❌ Error updating homepage CMS:', err);
        res.status(500).json({
            message: 'Failed to update homepage content',
            error: err.message,
        });
    }
};

module.exports = {
    getHomePageContent,
    updateHomePageConfig,
};