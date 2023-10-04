const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const { Sequelize } = require("sequelize");

const credential = require("../config/config.json");
var sequelize = null;
const dbCredential = credential["production"];

const dbConnection = async () => {
  try {
    sequelize = new Sequelize(
      dbCredential.database, //db name
      dbCredential.username, //db username
      dbCredential.password, //db password
      {
        host: dbCredential.host, //db hostname
        dialect: dbCredential.dialect,
        pool: {
          max: 100,
          min: 0,
          idle: 0,
          acquire: 3000,
          evict: 30000,
        },
      }
    );
    const modelsPath = path.resolve(__dirname, "..", "models");
    fs.readdirSync(modelsPath)
      .filter((file) => {
        return (
          file.indexOf(".") !== 0 &&
          file !== basename &&
          file.slice(-3) === ".js"
        );
      })
      .forEach((file) => {
        const model = require(path.join(modelsPath, file))(
          sequelize,
          Sequelize.DataTypes
        );
        sequelize[model.name] = model;
      });
    await sequelize.authenticate();
    await sequelize.sync(); //{ force: true } - to drop the table and add new table with new fields
    console.log("Connection has been established successfully.");
    return sequelize;
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Unable to connect to the database",
    });
  }
};

module.exports = dbConnection;
