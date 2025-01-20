const jwt = require('jsonwebtoken');

function auth(app, sequelize) {
  const { User } = sequelize;
  app.post('/login', async function sendOtp(req, res) {
    const { mobileNumber, password } = req.body;
    try {
      if (!mobileNumber) {
        return res.status(429).json({ message: 'Please provide with mobile number!' });
      }
      const userInstance = await User.findOne({ where: { mobileNumber } });
      if (!userInstance) {
        return res.status(404).json({ message: 'User not found!' });
      }
      const user = userInstance.dataValues;

      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid password!' });
      }
      const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });
      return res.status(200).json({ message: `Login successful`, token });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });
}

module.exports = auth;
