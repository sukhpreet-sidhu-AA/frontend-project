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
        const reviewImage = await ReviewImage.findByPk(req.params.imageId)
        if(reviewImage){
            const review = await Review.findByPk(reviewImage.reviewId)
            const authorized = authorization(req, review.userId)
            if(authorized !== true)
                return next(authorized)

            reviewImage.destroy()
            return res.json({message:'Successfully deleted'})
        }

        return res.status(404).json({message:"Review Image couldn't be found"})
    }
)

module.exports = router