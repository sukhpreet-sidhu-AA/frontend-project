'use strict';

/** @type {import('sequelize-cli').Migration} */

const { SpotImage, sequelize } = require('../models')
let options = {}
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await SpotImage.bulkCreate([
      {
        spotId:1,
        url:'www.testURL.com/image1',
        preview:true,
      },
      {
        spotId:2,
        url:'www.testURL.com/image2',
        preview:false,
      },
      {
        spotId:3,
        url:'www.testURL.com/image3',
        preview:true,
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [1, 2, 3]}
    })
  }
};
