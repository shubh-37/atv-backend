'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "users",
          "mobile_number",
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "retry_count",
          {
            type: Sequelize.DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
              max: {
                args: 3,
                msg: 'Max retry count reached!'
              }
            }
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "otp",
          {
            type: Sequelize.DataTypes.INTEGER,
            validate: {
              max: {
                args: 4,
                msg: 'Otp should be less than 4 characters'
              }
            }
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "users",
          "otp_generated_at",
          {
            type: Sequelize.DataTypes.DATE,
            allowNull: true,
            defaultValue: null
          },
          { transaction: t }
        )
      ]);
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("users", "mobile_number", { transaction: t }),
        queryInterface.removeColumn("users", "retry_count", {
          transaction: t,
        }),
        queryInterface.removeColumn("users", "otp", {
          transaction: t,
        }),
        queryInterface.removeColumn("users", "otp_generated_at", {
          transaction: t,
        }),
      ]);
    });
  }
};
