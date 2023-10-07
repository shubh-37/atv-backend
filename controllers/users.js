const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function userDefinedException(message, statusCode) {
  this.message = message;
  this.statusCode = statusCode;
}
function auth(app, sequelize) {
  const { User } = sequelize;
  app.post("/register", async function register(req, res) {
    const { username, password } = req.body;
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await User.create({
        username: username,
        password: hashedPassword,
      });
      if (user) {
        console.log(user.username);
        const token = jwt.sign(
          { username: user.username },
          process.env.JWT_SECRET,
          {
            expiresIn: "24h",
          }
        );
        return res.status(201).json({ token: token, username: username });
      } else {
        throw new userDefinedException(
          "Error creating user, please try after some time",
          400
        );
      }
    } catch (error) {
      if (error.message.match("E11000 duplicate key error collection:")) {
        return res.status(409).json({ message: "Duplicate User" });
      }
      return res.status(500).json({ message: error.message });
    }
  });

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
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
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
