const User = require('../models/auth');
const { AppError } = require('../middlewares/errorHandler');
const { catchAsync } = require('../middlewares/errorHandler');
const { createSendToken } = require('../middlewares/auth');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
// Register user with phone number only (as per scope)
const registerUser = catchAsync(async (req, res, next) => {
  const { name, phone , password, profileImageUrl} = req.body;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

if (!passwordRegex.test(password)) {
  return next(new AppError(
    'Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.',
    400
  ));
}
  // Check if user already exists
  const existingUser = await User.findOne({ phone });
  if (existingUser && existingUser.isVerified) {
    return next(new AppError('User already exists with this phone number. Please login instead.', 409));
  }
 // hash password 

 const hashPassword = await bcrypt.hash(password,8);
  let user;
  if (existingUser && !existingUser.isVerified) {
    // User exists but not verified, resend OTP
    user = existingUser;
    user.generateOTP();
    await user.save();
  } else {
    // Create new user
    user = new User({ phone ,name,password:hashPassword,profileImageUrl});
    user.generateOTP();
    await user.save();
  }

  res.status(201).json({
    status: 'success',
    message: 'Registration successful. Please verify your phone number using OTP.',
    data: {
      phone: user.phone,
      otpExpiresAt: user.otpExpires
    }
  });
});

// Verify OTP and complete registration
const verifyOTP = catchAsync(async (req, res, next) => {
  const {phone} = req.params;
  console.log(phone)
  const { otp } = req.body;

  // Find user by phone
  const user = await User.findOne({ phone });
  if (!user) {
    return next(new AppError('No user found with this phone number', 404));
  }

  // Verify OTP
  if (!user.verifyOTP(otp)) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

  // Clear OTP and mark as verified
  user.clearOTP();
  user.lastLogin = new Date();
  await user.save();

  // Send token
  createSendToken(user, 200, res);
});

// login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Check if phone and password are provided
    if (!phone || !password) {
      return res.status(400).json({
        status: 400,
        data: [],
        message: "Phone number and password are required",
      });
    }

    const validUser = await User.findOne({ phone });

    if (!validUser) {
      return res.status(404).json({
        status: 404,
        data: [],
        message: "User not found",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, validUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        data: [],
        message: "Invalid password",
      });
    }

    // Generate token after successful phone + password match
    const token = generateToken(validUser);

    return res.status(200).json({
      status: 200,
      data: { 
        user: {
          id: validUser._id,
          phone: validUser.phone,
          name: validUser.name,
          profileImageUrl: validUser.profileImageUrl,
          role: validUser.role,
          isVerified: validUser.isVerified,
          createdAt: validUser.createdAt
        },
        token 
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};


// Request new OTP (for existing users)
const requestOTP = catchAsync(async (req, res, next) => {
  const { phone } = req.body;

  const user = await User.findOne({ phone });
  if (!user) {
    return next(new AppError('No user found with this phone number. Please register first.', 404));
  }

  // Generate new OTP
  user.generateOTP();
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'OTP sent successfully',
    data: {
      phone: user.phone,
      otpExpiresAt: user.otpExpires
    }
  });
});

// Update user profile (name and profile image)
const updateProfile = catchAsync(async (req, res, next) => {
  const { name, profileImageUrl } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Update allowed fields only
  if (name !== undefined) user.name = name;
  if (profileImageUrl !== undefined) user.profileImageUrl = profileImageUrl;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        isVerified: user.isVerified
      }
    }
  });
});

// Get current user profile
const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    }
  });
});

// Logout user (invalidate token on client side)
const logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// Delete user account
const deleteAccount = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Soft delete - mark as inactive instead of permanent deletion
  user.isActive = false;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Account deleted successfully'
  });
});

// Check if phone number is available
const checkPhone = catchAsync(async (req, res, next) => {
  const { phone } = req.query;

  if (!phone) {
    return next(new AppError('Phone number is required', 400));
  }

  const existingUser = await User.findOne({ phone, isVerified: true });
  
  res.status(200).json({
    status: 'success',
    data: {
      available: !existingUser,
      message: existingUser ? 'Phone number already registered' : 'Phone number available'
    }
  });
});

module.exports = {
  registerUser,
  verifyOTP,
  requestOTP,
  updateProfile,
  getProfile,
  logout,
  deleteAccount,
  checkPhone,
  login
};
