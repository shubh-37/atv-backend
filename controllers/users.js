const jwt = require("jsonwebtoken");

function userDefinedException(message, statusCode) {
  this.message = message;
  this.statusCode = statusCode;
}
function auth(app, sequelize) {
  const { User } = sequelize;
  app.post("/login", async function login(req, res) {
    const { username, password } = req.body;
    try {
      if (!username || !password) {
        throw new userDefinedException(
          "Please enter both Email and Password",
          401
        );
      }
      const user = await User.findOne({ where: { username } });
      console.log(user);
      if (!user) {
        throw new userDefinedException("No user found!", 404);
      }
      if (password !== user.password) {
        throw new userDefinedException("Wrong password!", 401);
      }
      const token = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      return res.status(200).json({ token });
    } catch (error) {
      return res.status(error.statusCode).json({ message: error.message });
    }
  });
}

module.exports = auth;
