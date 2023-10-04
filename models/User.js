function createUser(sequelize, DataTypes) {
    const User = sequelize.define(
      "User",
      {
        username: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        timestamps: false,
        tableName: "users",
      }
    );
    return User;
  }
  
  module.exports = createUser;