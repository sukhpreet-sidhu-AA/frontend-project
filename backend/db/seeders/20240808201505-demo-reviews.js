'use strict';

const { Review } = require('../models')
let options = {}
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        spotId:1,
        userId:2,
        review:'It was great',
        stars:1,
      },
      {
        spotId:1,
        userId:3,
        review:'It was average',
        stars:1,
      },
      {
        spotId:2,
        userId:1,
        review:'It was great',
        stars:3,
      },
      {
        spotId:2,
        userId:3,
        review:'It was average',
        stars:1,
      },
      {
        spotId:3,
        userId:1,
        review:'It was great',
        stars:4,
      },
      {
        spotId:3,
        userId:2,
        review:'It was average',
        stars:1,
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [1,2,3] }
    })
  }
};
