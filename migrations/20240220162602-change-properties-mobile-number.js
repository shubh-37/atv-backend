'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'mobile_number', {
      type: Sequelize.STRING(20)
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'mobileNumber', {
      type: Sequelize.INTEGER
    });
  }
};
