const jwt = require('jsonwebtoken');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MAX_RETRY_COUNT = 4;

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
      const user = await User.findOne({ where: { mobileNumber } });
      if (!user) {
        return res.status(404).json({ message: 'User not found!' });
      }

      if (!user.otp) {
        const randomInt = getRandomInt(1000, 9999); // Generates a random integer between 1000 and 9999
        const otpGeneratedAt = new Date();
        let retryCount = user.retryCount + 1;
        //add send Interakt notification function
        const updatedUser = await user.update({
          otp: randomInt,
          retryCount,
          otpGeneratedAt
        });
        console.log(updatedUser);
        return res.status(200).json({ message: `Otp sent successfully to ${mobileNumber}` });
      }
      const isOtpValid = isStoredTimeWithin10Minutes(user.otpGeneratedAt);
      if (user.retryCount < MAX_RETRY_COUNT && isOtpValid) {
        let retryCount = user.retryCount + 1;
        const updatedUser = await user.update({
          retryCount
        });
        console.log(updatedUser);
        //add interakt notification
        return res.status(200).json({ message: `Otp sent successfully to ${mobileNumber}` });
      } else if (!isOtpValid) {
        console.log('Session timed out, try logging again');
        //clear otp, retry_count and otpGeneratedAt
        const updatedUser = await user.update({
          otp: null,
          retryCount: 0,
          otpGeneratedAt: null
        });
        console.log(updatedUser);
        return res.status(440).json({ message: 'Session timed out. Please login again' });
      } else {
        console.log('max retry count reached');
        //clear otp, retry_count and otpGeneratedAt
        const updatedUser = await user.update({
          otp: null,
          retryCount: 0,
          otpGeneratedAt: null
        });
        console.log(updatedUser);
        return res.status(429).json({ message: 'Max retry count reached. Please login again' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  });
  app.get('/verifyOtp', async function verifyOtp(req, res) {
    const { mobileNumber, otp } = req.body;
    try {
      if (!otp && !mobileNumber) {
        return res.status(401).json({ message: 'Please provide with mobile number and OTP!' });
      }
      const user = await User.findOne({ where: { mobileNumber } });
      if (!user) {
        return res.status(404).json({ message: 'User not found!' });
      }
      const isOtpValid = isStoredTimeWithin10Minutes(user.otpGeneratedAt);
      if (isOtpValid) {
        if (user.otp === otp) {
          const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
            expiresIn: '24h'
          });
          //reset everything
          const updatedUser = await user.update({
            otp: null,
            retryCount: 0,
            otpGeneratedAt: null
          });
          console.log(updatedUser);
          return res.status(200).json({ message: `Login successful`, token });
        } else {
          return res.status(401).json({ message: 'Incorrect OTP. Please try again' });
        }
      }
      console.log('go back to the login page and send otp again');
      const updatedUser = await user.update({
        otp: null,
        retryCount: 0,
        otpGeneratedAt: null
      });
      console.log(updatedUser);
      return res.status(440).json({ message: 'Session timed out. Please login again' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  });
}

module.exports = auth;
