const generateOTP = () => {
  return 112233
  // return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

module.exports = generateOTP;