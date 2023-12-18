'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "products",
          "createdAt",
          {
            type: Sequelize.DataTypes.DATE,
            defaultValue: new Date(),
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "products",
          "updatedAt",
          {
            type: Sequelize.DataTypes.DATE,
            defaultValue: new Date(),
          },
          { transaction: t }
        ),
      ]);
    });
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("products", "createdAt", { transaction: t }),
        queryInterface.removeColumn("products", "updatedAt", {
          transaction: t,
        }),
      ]);
    });
  }
};
