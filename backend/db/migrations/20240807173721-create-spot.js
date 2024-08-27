'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {}
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Spots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ownerId: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references: { model:'Users' },
        onDelete:'CASCADE'
      },
      address: {
        type: Sequelize.STRING(100),
        allowNull:false
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull:false,
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull:false
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull:false
      },
      lat: {
        type: Sequelize.FLOAT,
        allowNull:false
      },
      lng: {
        type: Sequelize.FLOAT,
        allowNull:false,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull:false
      },
      description: {
        type: Sequelize.STRING(120),
        allowNull:false
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull:false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);
  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'Spots'
    await queryInterface.dropTable(options);
  }
};