const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

var sequelize = null;
const dbConnection = require("./dbConnection/connect");
const productController = require("./controllers/products");
const authController = require("./controllers/users");

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("../uploads"));

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
