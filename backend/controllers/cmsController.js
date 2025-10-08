const HomePageConfig = require('../models/HomePageConfig');
const Product = require('../models/Product');

const getHomePageContent = async (req, res) => {
  try {
    let config = await HomePageConfig.findOne({}).lean();
    if (!config) {
      config = await HomePageConfig.create({});
    }

    // Get new arrival products (created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newArrivals = await Product.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 }).limit(10);

    // Get featured products
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
    res.status(500).json({ message: err.message });
  }
};

const updateHomePageConfig = async (req, res) => {
  try {
    const data = req.body;

    // Optional image uploads
    const files = req.files;
    if (files?.heroBanners?.length) {
      data.heroBanners = files.heroBanners.map((file, i) => ({
        ...JSON.parse(data.heroBannerMeta[i]), // passed JSON string from form
        image: file.path
      }));
    }

    if (files?.brandBanner?.[0]) {
      data.brandBanner = {
        ...JSON.parse(data.brandBannerMeta),
        image: files.brandBanner[0].path
      };
    }

    if (files?.bestSellerBanner?.[0]) {
      data.bestSellerBanner = {
        ...JSON.parse(data.bestSellerBannerMeta),
        image: files.bestSellerBanner[0].path
      };
    }

    if (files?.saleBanner?.[0]) {
      data.saleBanner = {
        ...JSON.parse(data.saleBannerMeta),
        image: files.saleBanner[0].path
      };
    }

    let config = await HomePageConfig.findOne();
    if (!config) {
      config = await HomePageConfig.create(data);
    } else {
      await HomePageConfig.updateOne({}, data);
    }

    res.json({ message: 'Homepage CMS updated successfully' });
  } catch (err) {
    console.error('Error updating homepage CMS:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getHomePageContent,
  updateHomePageConfig
};
