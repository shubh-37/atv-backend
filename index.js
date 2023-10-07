const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

var sequelize = null;
const dbConnection = require("./dbConnection/connect");
const productController = require("./controllers/products");
const authController = require("./controllers/users");

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.use(express.json());
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST");
  res.append("Access-Control-Allow-Headers", "Content-Type");
  res.append("Access-Control-Allow-Credentials", true);
  next();
});
app.use(cors());

async function start() {
  try {
    if (!sequelize) {
      sequelize = await dbConnection();
    } else {
      // restart connection pool to ensure connections are not re-used across invocations
      sequelize.connectionManager.initPools();
      // restore `getConnection()` if it has been overwritten by `close()`
      if (sequelize.connectionManager.hasOwnProperty("getConnection")) {
        delete sequelize.connectionManager.getConnection;
      }
    }
    productController(app, sequelize);
    authController(app, sequelize);
    app.listen(3001, () => {
      console.log("Server is listening on port:3001");
    });
  } catch (error) {
    console.log({ error });
  }
}

start();
