const Product = require('../models/product');
const User = require('../models/auth');

// Called when user is already verified
const postProduct = async (req, res) => {
  const user = req.user;
  const productData = req.body;


  let imageUrl = null;

  if (req.file) {
    const uploadRes = await uploadToCloud(req.file.buffer, req.file.originalname, req.file.mimetype);

    if (!uploadRes.success) {
      return res.status(500).json({ msg: 'Image upload failed', error: uploadRes.error });
    }

    imageUrl = uploadRes.fileUrl;
  }
  const product = new Product({
    ...productData,
    images: imageUrl,
    userId: user._id,
  });

  await product.save();

  res.status(201).json({
    msg: 'Product posted successfully',
    product
  });
};

// Called after user submits OTP
const verifyOtpAndPostProduct = async (req, res) => {
  const { phone, otp, productData } = req.body;
  console.log(req.body);


  if (!phone || !otp || !productData) {
    return res.status(400).json({ msg: 'phone, OTP, and product data required' });
  }

  let imageUrl = null;

  if (req.file) {
    const uploadRes = await uploadToCloud(req.file.buffer, req.file.originalname, req.file.mimetype);

    if (!uploadRes.success) {
      return res.status(500).json({ msg: 'Image upload failed', error: uploadRes.error });
    }

    imageUrl = uploadRes.fileUrl;
  }
  const user = await User.findOne({ phone});
  if (!user) return res.status(404).json({ msg: 'User not found' });

  if (user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ msg: 'Invalid or expired OTP' });
  }

  user.verified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  const newProduct = new Product({
    ...productData,
    images: imageUrl,
    userId: user._id,
  });

  await newProduct.save();

  res.status(201).json({
    msg: 'OTP verified and product posted successfully',
    product: newProduct,
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
  verifyOtpAndPostProduct,
  // browseFiltersProducts,
  browseProducts
};

module.exports = productController;