const User = require('../models/auth');

const checkUserVerified = async (req, res, next) => {
 
  const productData = req.body;

  const { phone } = req.body;

  
  if (!phone) {
    return res.status(400).json({ msg: 'phone is required' });
  }

  const user = await User.findOne({ phone });

  if (!user) {
    return res.status(404).json({ msg: 'User not found. Please register first.' });
  }

  if (user.isVerified) {
    req.user = user;
    req.productData = productData;
    return next();
  }

  const otp = 112233;
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
  if (!user.isVerified) {
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    return res.status(404).json({
      status: 404,
      data: [],
      message: "User is not verified please phone veriferd "
    })
  }


};


module.exports = { checkUserVerified };
