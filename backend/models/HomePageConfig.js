const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: String,
  title: String,
  subtitle: String,
  buttonText: String,
  buttonLink: String,
  textAlign: { type: String, default: 'center' },
  textColor: { type: String, default: '#000' },
  animation: { type: String, default: 'fade' },
  overlay: { type: Boolean, default: false }
});

const homePageConfigSchema = new mongoose.Schema({
  heroBanners: [bannerSchema],

  brandBanner: bannerSchema,

  bestSellerBanner: {
    image: String,
    title: String,
    buttonText: String,
    buttonLink: String,
    textAlign: String,
    textColor: String,
    animation: String
  },

  saleBanner: {
    image: String,
    title: String,
    buttonText: String,
    buttonLink: String,
    isActive: { type: Boolean, default: false }
  },

  newArrivalsSection: {
    heading: String,
    subheading: String,
    buttonText: String,
    buttonLink: String,
    textAlign: String,
    textColor: String,
    background: String,
    animation: String
  },

  featuredProductIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],

  announcements: [
    {
      message: String,
      backgroundColor: String,
      textColor: String,
      animation: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('HomePageConfig', homePageConfigSchema);
