function createUser(sequelize, DataTypes) {
  const User = sequelize.define(
    'User',
    {
      username: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      mobileNumber: {
        type: DataTypes.STRING(20),
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
          isFourDigits(value) {
            if (value && value.toString().length !== 4) {
              throw new Error('OTP should be exactly 4 digits');
            }
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
      tableName: 'users'
    }
  );
  return User;
}

module.exports = createUser;
