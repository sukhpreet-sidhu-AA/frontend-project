const express = require('express');
const router = express.Router();
const { Spot, Review, SpotImage, User, ReviewImage } = require('../../db/models')
const { requireAuth, authorization } = require('../../utils/auth');
const { Op } = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

router.get('/current', 
    requireAuth, 
    async (req, res) => {
        const { user } = req;
        const reviews = await Review.findAll({
            raw:true,
            nest:true,
            where: {userId:user.id},
            include: [
                {
                    model:User,
                    attributes:['id', 'firstName', 'lastName']
                },
                {
                    model:Spot,
                    attributes:{ exclude: ['createdAt', 'updatedAt']}
                }, 
                {
                    model:ReviewImage,
                    attributes:['id','url']
                }
            ]
        })

        for(let review of reviews){

            const spotImage = await SpotImage.findOne({where: { spotId:review.spotId, preview:true } })
            if(spotImage){
                review.Spot.previewImage = spotImage.url
                }
            else
                review.Spot.previewImage = 'No preview available'
            

        }
        
        return res.json({Reviews:reviews})
})

router.post('/:reviewId/images', 
    requireAuth,
    async (req, res, next) => {
        const review = await Review.findOne({ where: { id:req.params.reviewId}})
        if(review){
            const authorized = authorization(req, review.userId)
            if(authorized !== true)
                return next(authorized)

            const reviewId = review.id
            const count = await ReviewImage.count({ where: { reviewId:reviewId}})
            if(count < 10){
                const { url } = req.body;
                const newReviewImage = await ReviewImage.create({ reviewId, url })
                res.status(201)
                return res.json(newReviewImage)
            }
            res.status(403)
            return res.json({message: "Maximum number of images for this resource was reached"})
        }
        res.status(404)
        return res.json({message:"Review couldn't be found"})
    }
)

const validateReview = [
    check('review')
        .exists({checkFalsy:true})
        .isLength({ min:1, max: 600})
        .withMessage('Review text is required'),
    check('stars')
        .exists({ heckFalsy:true })
        .isInt({ min:1, max:5 })
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
]

router.put('/:reviewId', 
    requireAuth,
    validateReview,
    async (req, res, next) => {
        const userReview = await Review.findByPk(req.params.reviewId)
        if(userReview){
            const authorized = authorization(req, userReview.userId)
            if(authorized !== true)
                return next(authorized)

            const { review, stars } = req.body
            userReview.set({ review, stars })
            userReview.save()
            return res.json(userReview)
        }
        res.status(404)
        return res.json({message: "Review couldn't be found"})
    }
)

router.delete('/:reviewId',
    requireAuth,
    async (req, res, next) => {
        const userReview = await Review.findByPk(req.params.reviewId)
        if(userReview){
            const authorized = authorization(req, userReview.userId);
            if(authorized !== true)
                return next(authorized)

            userReview.destroy()
            return res.json({message:'Successfully deleted'})
        }
        res.status(404)
        return res.json({message: "Review couldn't be found"})
    }
)


module.exports = router