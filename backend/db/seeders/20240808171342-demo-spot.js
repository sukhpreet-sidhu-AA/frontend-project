'use strict';

const { Spot } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Spot.bulkCreate([
      {
        ownerId:1,
        address:'123 Tester Lane',
        city:'Los Testeles',
        state:'California',
        country: 'United States',
        lat: 34.052235,
        lng:-118.243683,
        name:'Test House',
        description:'Test house for test purposes',
        price: 100.00
      },
      {
        ownerId:2,
        address:'234 Tester Lane',
        city:'San Francisco',
        state:'California',
        country:'United States',
        lat:37.773972,
        lng:-122.431297,
        name: 'SF House',
        description:'A house in SF nothing more',
        price: 200.00
      },
      {
        ownerId:3,
        address: '345 Tester Lane',
        city: 'San Jose',
        state: 'California',
        country: 'United States',
        lat: 37.335278,
        lng: -121.891944,
        name: 'Tech House',
        description: 'A house in San Jose, maybe close to some tech companies',
        price: 300.00
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Test House', 'SF House', 'Tech House'] }
    }, {})
  }
};
