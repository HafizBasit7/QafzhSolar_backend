const Product = require('../models/product');
const User = require('../models/auth');
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
  const {phone, otp } = req.body;
  console.log(req.body);


  if (!otp) {
    return res.status(400).json({ msg: ' OTP required' });
  }
  const user = await User.findOne({ phone });
  if (!user) return res.status(404).json({ msg: 'User not found' });

  if (user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ msg: 'Invalid or expired OTP' });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save()
  res.status(201).json({
    msg: 'OTP verified  successfully',
  });
};

// updateProduct
const updateProduct = async (req, res) => {
  try {
    const user = req.user;
    const productId = req.params.id;
    const updatedData = req.body;

    // Ensure product belongs to the current user
    const product = await Product.findOne({ _id: productId, userId: user._id });

    if (!product) {
      return res.status(404).json({ msg: "Product not found or unauthorized" });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updatedData },
      { new: true }
    );

    res.status(200).json({
      msg: "Product updated successfully",
      updatedProduct
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to update product", error: err.message });
  }
};

//delete Product

const deleteProduct = async (req, res) => {
  try {
    const user = req.user;
    const productId = req.params.id;

    // Ensure product belongs to the current user
    const product = await Product.findOne({ _id: productId, userId: user._id });

    if (!product) {
      return res.status(404).json({ msg: "Product not found or unauthorized" });
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json({ msg: "Product deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to delete product", error: err.message });
  }
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

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 400,
        message: "Invalid product ID"
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "product not found"
      });
    }

    res.status(200).json({
      status: 200,
      data: product,
      message: "product fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }
};

// controllers/productController.js
const getUserProducts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({
        status: 400,
        message: "User ID is required"
      });
    }

    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ userId })
    ]);

    res.status(200).json({
      status: 200,
      data: products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      message: "User products fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching user products:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }
};
const productController = {
  postProduct,
  verifyOtp,
  // browseFiltersProducts,
  browseProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getUserProducts 

};

module.exports = productController;