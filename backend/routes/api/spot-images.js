const express = require('express');
const router = express.Router();
const { Spot, Review, SpotImage, User, ReviewImage, Booking } = require('../../db/models')
const { requireAuth, authorization } = require('../../utils/auth');
const { Op } = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

router.delete('/:imageId',
    requireAuth,
    async (req, res, next) => {
        const spotImage = await SpotImage.findByPk(req.params.imageId)
        if(spotImage){
            const spot = await Spot.findByPk(spotImage.spotId)
            const authorized = authorization(req, spot.ownerId)
            if(authorized !== true)
                return next(authorized)

            spotImage.destroy()
            return res.json({message:'Successfully deleted'})
        }
        return res.status(404).json({message: "Spot Image couldn't be found"})
    }
)

module.exports = router