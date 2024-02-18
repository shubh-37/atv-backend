const jwt = require('jsonwebtoken');

function userDefinedException(message, statusCode) {
  this.message = message;
  this.statusCode = statusCode;
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
        throw new userDefinedException('Please enter mobile number', 401);
      }
      const user = await User.findOne({ where: { mobileNumber } });
      if (!user) {
        throw new userDefinedException('No user found!', 404);
      }

      if (!user.otp) {
        const randomInt = getRandomInt(1000, 9999); // Generates a random integer between 1 and 100
        console.log(randomInt);
        const otpGeneratedAt = new Date();
        let retryCount = user.retryCount + 1;
        //add send Interakt notification function
        const updatedUser = await user.update({
          otp,
          retryCount,
          otpGeneratedAt
        });
        console.log(updatedUser);
        return res
          .status(200)
          .json({ message: `Otp sent successfully to ${mobileNumber}` });
      } else {
        let isOtpValid;
        isOtpValid = isStoredTimeWithin10Minutes(user.otpGeneratedAt);
        if (user.retryCount < 3) {
          if (isOtpValid) {
            let retryCount = user.retryCount + 1;
            const updatedUser = await user.update({
              otp,
              retryCount,
              otpGeneratedAt
            });
            console.log(updatedUser);
            //add interakt notification
            return res
              .status(200)
              .json({ message: `Otp sent successfully to ${mobileNumber}` });
          } else {
            console.log('Session timed out, try logging again');
            //clear otp, retry_count and otpGeneratedAt
            const updatedUser = await user.update({
              otp: null,
              retryCount: 0,
              otpGeneratedAt: null
            });
            console.log(updatedUser);
            return res
              .status(440)
              .json({ message: 'Session timed out. Please login again' });
          }
        } else {
          console.log('max retry count reached');
          //clear otp, retry_count and otpGeneratedAt
          const updatedUser = await user.update({
            otp: null,
            retryCount: 0,
            otpGeneratedAt: null
          });
          console.log(updatedUser);
          return res
            .status(429)
            .json({ message: 'Max retry count reached. Please login again' });
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  });
  app.get('/verifyOtp', async function verifyOtp(req, res) {
    const { mobileNumber, otp } = req.body;
    try {
      if (!otp) {
        throw new userDefinedException('OTP is not present', 401);
      }
      const user = await User.findOne({ where: { mobileNumber } });
      if (!user) {
        throw new userDefinedException('No user found!', 404);
      }
      let isOtpValid;
      isOtpValid = isStoredTimeWithin10Minutes(user.otpGeneratedAt);
      if (isOtpValid) {
        if (user.otp === otp) {
          const token = jwt.sign(
            { username: user.username },
            process.env.JWT_SECRET,
            {
              expiresIn: '24h'
            }
          );
          //reset everything
          const updatedUser = await user.update({
            otp: null,
            retryCount: 0,
            otpGeneratedAt: null
          });
          console.log(updatedUser);
          return res.status(200).json({ message: `Login successful`, token });
        } else {
          return res
            .status(401)
            .json({ message: 'Incorrect OTP. Please try again' });
        }
      } else {
        console.log('go back to the login page and send otp again');
        const updatedUser = await user.update({
          otp: null,
          retryCount: 0,
          otpGeneratedAt: null
        });
        console.log(updatedUser);
        return res
          .status(440)
          .json({ message: 'Session timed out. Please login again' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  });
}

module.exports = auth;
