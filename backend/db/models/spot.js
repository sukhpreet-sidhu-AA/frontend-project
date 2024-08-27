'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Spot.belongsTo(models.User, { foreignKey: 'ownerId' })
      Spot.hasMany(models.Booking, { foreignKey:'spotId' })
      Spot.hasMany(models.SpotImage, { foreignKey:'spotId' })
      Spot.hasMany(models.Review, { foreignKey:'spotId' })
    }
  }
  Spot.init({
    ownerId: {
      type:DataTypes.INTEGER,
      allowNull:false
    },
    address: {
      type:DataTypes.STRING(100),
      allowNull:false,
      validate:{
        len:[1,100]
      }
    },
    city: {
      type:DataTypes.STRING(100),
      allowNull:false,
      validate:{
        len:[1,100]
      }
    },
    state: {
      type:DataTypes.STRING(100),
      allowNull:false,
      validate:{
        len:[1,100]
      }
    },
    country: {
      type:DataTypes.STRING(100),
      allowNull:false,
      validate:{
        len:[1,30]
      }
    },
    lat: {
      type:DataTypes.FLOAT,
      allowNull:false,
      validate:{
        min:-90,
        max:90
      }
    },
    lng: {
      type:DataTypes.FLOAT,
      allowNull:false,
      validate:{
        min:-180,
        max:180
      }
    },
    name: {
      type:DataTypes.STRING(50),
      allowNull:false,
      validate:{
        len:[1,50]
      }
    },
    description: {
      type:DataTypes.STRING(120),
      allowNull:false,
      validate:{
        len:[1,120]
      }
    },
    price: {
      type:DataTypes.FLOAT,
      allowNull:false,
      validate:{
        min:0
      }
    }
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};