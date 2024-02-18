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
        mobileNumber: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'mobile_number'
        },
        retryCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          validate: {
            max: {
              args: 3,
              msg: 'Max retry count reached!'
            }
          },
          field: 'retry_count'
        },
        otp: {
          type: DataTypes.INTEGER,
          validate: {
            max: {
              args: 4,
              msg: 'Otp should be less than 4 characters'
            }
        }
      },
        otpGeneratedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
          field: 'otp_generated_at'
        }
      },
      {
        timestamps: false,
        tableName: "users",
      }
    );
    return User;
  }
  
  module.exports = createUser;