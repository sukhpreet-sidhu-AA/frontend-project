'use strict';

/** @type {import('sequelize-cli').Migration} */

const { Booking } = require('../models')
let options = {}
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Booking.bulkCreate([
      {
        spotId: 1,
        userId: 1,
        startDate:"2024-08-12",
        endDate:'2024-08-13'
      },
      {
        spotId: 2,
        userId: 2,
        startDate:"2024-08-22",
        endDate:'2024-08-23'
      },
      {
        spotId: 3,
        userId: 3,
        startDate:"2024-08-25",
        endDate:'2024-08-27'
      },
      {
        spotId: 3,
        userId: 3,
        startDate:"2024-08-29",
        endDate:'2024-08-30'
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [1, 2, 3] }
    })
  }
};
