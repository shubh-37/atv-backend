const jwt = require('jsonwebtoken');
const sendInteraktNotification = require('../middleware/sendInteraktNotification');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MAX_RETRY_COUNT = 3;
const eventName = 'Send OTP Message';

function isStoredTimeWithin10Minutes(otpGeneratedAt) {
  // Convert stored time to Date object
  const storedDate = new Date(otpGeneratedAt);

  // Get current time
  const currentDate = new Date();

  // Calculate difference in milliseconds
  const differenceInMilliseconds = currentDate - storedDate;

  // Convert difference to minutes
  const differenceInMinutes = differenceInMilliseconds / (1000 * 60); // 1000 milliseconds in a second, 60 seconds in a minute

  // Check if difference is less than 10 minutes
  return differenceInMinutes < 10;
}

function auth(app, sequelize) {
  const { User } = sequelize;
  app.post('/sendOtp', async function sendOtp(req, res) {
    const { mobileNumber } = req.body;
    try {
      if (!mobileNumber) {
        return res.status(401).json({ message: 'Please provide with mobile number!' });
      }
      const userInstance = await User.findOne({ where: { mobileNumber } });
      if (!userInstance) {
        return res.status(404).json({ message: 'User not found!' });
      }
      const user = userInstance.dataValues;
      if (!user.otp) {
        const randomInt = getRandomInt(1000, 9999); // Generates a random integer between 1000 and 9999
        const otpGeneratedAt = new Date();
        let retryCount = user.retryCount + 1;
        //add send Interakt notification function
        try {
          const userDetails = { phoneNumber: user.mobileNumber, otp: randomInt };
          const interaktResponse = await sendInteraktNotification(userDetails, eventName);
          if (interaktResponse.result) {
            const updatedUser = await userInstance.update({
              otp: randomInt,
              retryCount,
              otpGeneratedAt
            });
            return res.status(200).json({ message: `Otp sent successfully to ${mobileNumber}`, retryCount });
          }
        } catch (error) {
          if (error?.result === false) {
            return res.status(400).json({ message: 'Unable to find the user, please create a new user in Interakt' });
          }
          return res.status(500).json({ message: error });
        }
      }
      const isOtpValid = isStoredTimeWithin10Minutes(user.otpGeneratedAt);
      if (!isOtpValid) {
        console.log('Session timed out, try logging again');
        //clear otp, retry_count and otpGeneratedAt
        const updatedUser = await userInstance.update({
          otp: null,
          retryCount: 0,
          otpGeneratedAt: null
        });
        return res.status(440).json({ message: 'Session timed out. Please login again' });
      } else if (user.retryCount === MAX_RETRY_COUNT) {
        console.log('max retry count reached');
        //clear otp, retry_count and otpGeneratedAt
        const updatedUser = await userInstance.update({
          otp: null,
          retryCount: 0,
          otpGeneratedAt: null
        });
        return res.status(429).json({ message: 'Max retry count reached. Please login again' });
      }
      let retryCount = user.retryCount + 1;
      try {
        const userDetails = { phoneNumber: user.mobileNumber, otp: user.otp };
        const interaktResponse = await sendInteraktNotification(userDetails, eventName);
        if (interaktResponse.result) {
          const updatedUser = await userInstance.update({
            retryCount
          });
          return res.status(200).json({ message: `Otp sent successfully to ${mobileNumber}`, retryCount });
        }
      } catch (error) {
        if (error?.result === false) {
          return res.status(400).json({ message: 'Unable to find the user, please create a new user in Interakt' });
        }
        return res.status(500).json({ message: error });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });
  app.post('/verifyOtp', async function verifyOtp(req, res) {
    const { mobileNumber, otp } = req.body;
    try {
      if (!otp && !mobileNumber) {
        return res.status(401).json({ message: 'Please provide with mobile number and OTP!' });
      }
      const userInstance = await User.findOne({ where: { mobileNumber } });
      if (!userInstance) {
        return res.status(404).json({ message: 'User not found!' });
      }
      const user = userInstance.dataValues;
      const isOtpValid = isStoredTimeWithin10Minutes(user.otpGeneratedAt);
      if (!isOtpValid) {
        const updatedUser = await userInstance.update({
          otp: null,
          retryCount: 0,
          otpGeneratedAt: null
        });
        return res.status(440).json({ message: 'Session timed out. Please login again' });
      }
      if (user.otp !== otp) {
        return res.status(401).json({ message: 'Incorrect OTP. Please try again' });
      }
      const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });
      //reset everything
      const updatedUser = await userInstance.update({
        otp: null,
        retryCount: 0,
        otpGeneratedAt: null
      });
      return res.status(200).json({ message: `Login successful`, token });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });
}

module.exports = auth;
