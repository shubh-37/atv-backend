'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint('users', {
      fields: ['otp'],
      type: 'check',
      where: {
        otp: Sequelize.literal('LENGTH(otp::text) = 4') // Check if OTP has exactly 4 digits
      },
      name: 'check_otp_length'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('users', 'check_otp_length');
  }
};
