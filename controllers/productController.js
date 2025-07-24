const Product = require('../models/product');
const User = require('../models/auth');
const {uploadToCloud} = require("../utils/uploadToCloud");

// Called when user is already verified
const postProduct = async (req, res) => {
  try {
    const user = req.user;
    const productData = req.body;

    const product = new Product({
      ...productData,
      userId: user._id
    });

    await product.save();

    res.status(201).json({
      msg: 'Product posted successfully',
      product
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to post product', error: err.message });
  }
};
;


// Called after user submits OTP
const verifyOtp = async (req, res) => {
  const {  otp } = req.body;
  console.log(req.body);


  if (!otp ) {
    return res.status(400).json({ msg: ' OTP required' });
  }
  const user = await User.findOne({ phone});
  if (!user) return res.status(404).json({ msg: 'User not found' });

  if (user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ msg: 'Invalid or expired OTP' });
  }

  user.isVerified= true;
  user.otp = null;
  user.otpExpires = null;
  await user.save()
  res.status(201).json({
    msg: 'OTP verified  successfully',
  });
};

// brower Products 

const browseProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;   // Default page = 1
    const limit = parseInt(req.query.limit) || 10; // Default limit = 10

    const filter = { status: 'approved' }; // Only approved listings

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error("Browse Error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




// brower products with filters
// const browseFiltersProducts = async (req, res) => {
//   try {
//     const {
//       type,
//       condition,
//       brand,
//       governorate,
//       city,
//       price,
//       page = 1,
//       limit = 10
//     } = req.query;

//     const filter = { status: 'approved' }; // only show approved listings

//     if (type) filter.type = type;
//     if (condition) filter.condition = condition;
//     if (brand) filter.brand = brand;
//     if (governorate) filter.governorate = governorate;
//     if (city) filter.city = city;
//     if (price) filter.price = parseInt(price)


//     const products = await Product.find(filter)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     const total = await Product.countDocuments(filter);

//     res.json({
//       success: true,
//       data: products,
//       total,
//       currentPage: parseInt(page),
//       totalPages: Math.ceil(total / limit)
//     });

//   } catch (err) {
//     console.error("Browse Error:", err);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };


const productController = {
  postProduct,
  verifyOtp,
  // browseFiltersProducts,
  browseProducts
};

module.exports = productController;