// utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id, // Changed from _id to id to match auth middleware
      phone: user.phone,
      role: user.role
    },
    process.env.SECRET_KEY,
    {
      expiresIn: '7d' // Valid for 7 days
    }
  );
};

module.exports = generateToken;
