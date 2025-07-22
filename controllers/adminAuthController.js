const Admin = require('../models/admin');
const { AppError } = require('../middlewares/errorHandler');
const { catchAsync } = require('../middlewares/errorHandler');
const { createSendToken } = require('../middlewares/auth');

// Admin login
const loginAdmin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Find admin and include password field
  const admin = await Admin.findOne({ email }).select('+password +isActive +loginAttempts +lockUntil');
  
  if (!admin) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if admin is active
  if (!admin.isActive) {
    return next(new AppError('Admin account is inactive. Please contact support.', 401));
  }

  // Check if account is locked
  if (admin.isLocked) {
    return next(new AppError('Account is temporarily locked due to multiple failed login attempts. Please try again later.', 423));
  }

  // Verify password
  const isValidPassword = await admin.comparePassword(password);
  
  if (!isValidPassword) {
    // Increment login attempts
    await admin.incLoginAttempts();
    return next(new AppError('Invalid email or password', 401));
  }

  // Reset login attempts on successful login
  await admin.resetLoginAttempts();

  // Send token
  createSendToken(admin, 200, res);
});

// Get current admin profile
const getAdminProfile = catchAsync(async (req, res, next) => {
  const admin = await Admin.findById(req.user._id).select('-password -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil');
  
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      admin
    }
  });
});

// Update admin profile
const updateAdminProfile = catchAsync(async (req, res, next) => {
  const { name, phone, profileImageUrl } = req.body;

  const admin = await Admin.findById(req.user._id);
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  // Update allowed fields only
  if (name !== undefined) admin.name = name;
  if (phone !== undefined) admin.phone = phone;
  if (profileImageUrl !== undefined) admin.profileImageUrl = profileImageUrl;

  await admin.save();

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        profileImageUrl: admin.profileImageUrl,
        role: admin.role,
        permissions: admin.permissions
      }
    }
  });
});

// Change admin password
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError('Please provide current password, new password, and confirm password', 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new AppError('New password and confirm password do not match', 400));
  }

  if (newPassword.length < 6) {
    return next(new AppError('New password must be at least 6 characters long', 400));
  }

  // Get admin with password
  const admin = await Admin.findById(req.user._id).select('+password');
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  // Verify current password
  const isValidPassword = await admin.comparePassword(currentPassword);
  if (!isValidPassword) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Update password
  admin.password = newPassword;
  await admin.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully'
  });
});

// Admin logout
const logoutAdmin = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// Create new admin (Super admin only)
const createAdmin = catchAsync(async (req, res, next) => {
  const { name, email, password, role, permissions } = req.body;

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return next(new AppError('Admin with this email already exists', 409));
  }

  // Create admin
  const admin = new Admin({
    name,
    email,
    password,
    role: role || 'admin',
    permissions: permissions || {}
  });

  await admin.save();

  // Remove password from response
  admin.password = undefined;

  res.status(201).json({
    status: 'success',
    message: 'Admin created successfully',
    data: {
      admin
    }
  });
});

// Get all admins (Super admin only)
const getAllAdmins = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search } = req.query;

  let query = { isActive: true };
  
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
  }

  const admins = await Admin.find(query)
    .select('-password -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Admin.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: admins.length,
    data: {
      admins,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

// Update admin permissions (Super admin only)
const updateAdminPermissions = catchAsync(async (req, res, next) => {
  const { adminId } = req.params;
  const { permissions, role } = req.body;

  const admin = await Admin.findById(adminId);
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  // Update permissions and/or role
  if (permissions) admin.permissions = permissions;
  if (role) admin.role = role;

  await admin.save();

  res.status(200).json({
    status: 'success',
    message: 'Admin permissions updated successfully',
    data: {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    }
  });
});

// Deactivate admin (Super admin only)
const deactivateAdmin = catchAsync(async (req, res, next) => {
  const { adminId } = req.params;

  const admin = await Admin.findById(adminId);
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  // Prevent deactivating super admin
  if (admin.isSuperAdmin) {
    return next(new AppError('Cannot deactivate super admin', 403));
  }

  admin.isActive = false;
  await admin.save();

  res.status(200).json({
    status: 'success',
    message: 'Admin deactivated successfully'
  });
});

module.exports = {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  logoutAdmin,
  createAdmin,
  getAllAdmins,
  updateAdminPermissions,
  deactivateAdmin
};