const Product = require('../models/product');
const Shop = require('../models/shop');
const Engineer = require('../models/engineer');
const Ads = require('../models/ads');
const User = require('../models/auth');
const getAdminDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalShops = await Shop.countDocuments();
    const totalEngineers = await Engineer.countDocuments();
    const activeEngineers = await Engineer.countDocuments({ isActive: true });
    const totalAds = await Ads.countDocuments();
    const totalUsers = await User.countDocuments();


    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalShops,
        totalEngineers,
        activeEngineers,
        totalAds,
        totalUsers
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats', error });
  }
};

const adminStatsContoller ={
    getAdminDashboardStats
};
module.exports = adminStatsContoller;