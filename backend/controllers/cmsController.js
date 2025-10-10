const HomePageConfig = require('../models/HomePageConfig');
const Product = require('../models/Product');

// Helper to safely parse JSON strings from form-data
const parseJsonSafely = (str) => {
    try {
        return JSON.parse(str);
    } catch (err) {
        console.warn('Failed to parse JSON:', str);
        return {};
    }
};

// GET homepage content for frontend
const getHomePageContent = async (req, res) => {
    try {
        let config = await HomePageConfig.findOne({}).lean();

        if (!config) {
            config = await HomePageConfig.create({});
        }

        // New arrivals: last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newArrivals = await Product.find({
            createdAt: { $gte: thirtyDaysAgo }
        }).sort({ createdAt: -1 }).limit(10);

        // Featured products
        const featuredProducts = await Product.find({
            _id: { $in: config.featuredProductIds || [] }
        });

        res.json({
            ...config,
            newArrivals,
            featuredProducts
        });
    } catch (err) {
        console.error('Error fetching homepage CMS:', err);
        res.status(500).json({
            message: 'Failed to fetch homepage content',
            error: err.message
        });
    }
};

// PUT: update homepage content
const updateHomePageConfig = async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;

        // Parse featuredProductIds from string to ObjectId[]
        if (data.featuredProductIds) {
            try {
                const parsed = JSON.parse(data.featuredProductIds);
                data.featuredProductIds = Array.isArray(parsed) ? parsed : [parsed];
            } catch (err) {
                console.warn('Invalid featuredProductIds format:', data.featuredProductIds);
                data.featuredProductIds = [];
            }
        }

        // Hero Banners
        if (files?.heroBanners?.length && data.heroBannerMeta) {
            const metas = Array.isArray(data.heroBannerMeta)
                ? data.heroBannerMeta
                : [data.heroBannerMeta];

            data.heroBanners = files.heroBanners.map((file, i) => ({
                ...parseJsonSafely(metas[i]),
                image: file.path
            }));
        }

        // Brand Banner
        if (files?.brandBanner?.[0] && data.brandBannerMeta) {
            data.brandBanner = {
                ...parseJsonSafely(data.brandBannerMeta),
                image: files.brandBanner[0].path
            };
        }

        // Best Seller Banner
        if (files?.bestSellerBanner?.[0] && data.bestSellerBannerMeta) {
            data.bestSellerBanner = {
                ...parseJsonSafely(data.bestSellerBannerMeta),
                image: files.bestSellerBanner[0].path
            };
        }

        // Sale Banner
        if (files?.saleBanner?.[0] && data.saleBannerMeta) {
            data.saleBanner = {
                ...parseJsonSafely(data.saleBannerMeta),
                image: files.saleBanner[0].path
            };
        }

        // Announcements with images
        if (files?.announcementImages?.length && data.announcementMeta) {
            const metas = Array.isArray(data.announcementMeta)
                ? data.announcementMeta
                : [data.announcementMeta];

            data.announcements = files.announcementImages.map((file, i) => ({
                ...parseJsonSafely(metas[i]),
                image: file.path
            }));
        }

        // Save to DB
        let config = await HomePageConfig.findOne();
        if (!config) {
            config = await HomePageConfig.create(data);
        } else {
            await HomePageConfig.updateOne({}, data);
        }

        res.json({ message: 'Homepage CMS updated successfully' });

    } catch (err) {
        console.error('Error updating homepage CMS:', err);
        res.status(500).json({
            message: 'Failed to update homepage content',
            error: err.message
        });
    }
};

module.exports = {
    getHomePageContent,
    updateHomePageConfig
};
