'use strict';

/** @type {import('sequelize-cli').Migration} */

const { ReviewImage, sequelize } = require('../models')
let options = {}
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await ReviewImage.bulkCreate([
      {
        reviewId: 1,
        url: 'test-url',
      },
      {
        reviewId: 2,
        url: 'test-url',
      },
      {
        reviewId: 3,
        url: 'test-url',
      },
      {
        reviewId: 4,
        url: 'test-url',
      },
      {
        reviewId: 5,
        url: 'test-url',
      },{
        reviewId: 6,
        url: 'test-url',
      },
      {
        reviewId: 6,
        url: 'test-url',
      },

    ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      reviewId: { [Op.in]: [1,2,3,4,5,6]}
    })
  }
};
