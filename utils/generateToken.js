// utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      phone: user.phone,
      role: user.role
    },
    process.env.SECRET_KEY,
    {
      expiresIn: '1d' // Valid for 7 days
    }
  );
};

module.exports = generateToken;
