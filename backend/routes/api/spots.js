const express = require('express');
const router = express.Router();
const { Spot, Review, SpotImage, User, ReviewImage, Booking } = require('../../db/models')
const { requireAuth, authorization } = require('../../utils/auth');
const { Op } = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const booking = require('../../db/models/booking');


router.get('/', async(req, res) => {

    let { page, size , minLat, maxLat, minLng, maxLng, minPrice, maxPrice} = req.query
    let errors = {}
    let where = {}

    if(page){
        if(page < 1)
            errors.page = "Page must be greater than or equal to 1"
        page = parseInt(page)
    }
    else page = 1

    if(size){
        if(size < 1 || size > 20)
            errors.size = "Size must be between 1 and 20"
        size = parseInt(size)
    }
    else size = 20

    if(minLat){
        minLat = parseFloat(minLat)
        where.lat = { [Op.gte]: minLat }
			if (minLat < -90 || minLat > 90 || isNaN(minLat)) {
				errors.minLat = 'Minimum latitude is invalid'
			}
    }

    if (maxLat) {
        maxLat = parseFloat(maxLat)
        where.lat = { ...where.lat, [Op.lte]: maxLat }
        if (maxLat < -90 || maxLat > 90 || isNaN(maxLat)) {
            errors.maxLat = 'Maximum latitude is invalid'
        }
    }

    if (minLng) {
        minLng = parseFloat(minLng)
        where.lng = { [Op.gte]: minLng }
        if (minLng < -180 || minLng > 180 || isNaN(minLng)) {
            errors.minLng = 'Minimum longitude is invalid'
        }
    }

    if (maxLng) {
        maxLng = parseFloat(maxLng)
        where.lng = { ...where.lng, [Op.lte]: maxLng }
        if (maxLng < -180 || maxLng > 180 || isNaN(maxLng)) {
            errors.maxLng = 'Maximum longitude is invalid'
        }
    }

    if (minPrice) {
        minPrice = parseFloat(minPrice)
        where.price = { [Op.gte]: minPrice }
        if (minPrice < 0 || isNaN(minPrice)) {
            errors.minPrice = 'Minimum price must be greater than or equal to 0'
        }
    }

    if (maxPrice) {
        maxPrice = parseFloat(maxPrice)
        where.price = { ...where.price, [Op.lte]: maxPrice }
        if (maxPrice < 0 || isNaN(maxPrice)) {
            errors.maxPrice = 'Maximum price must be greater than or equal to 0'
        }
    }


    if(Object.keys(errors).length)
        return res.status(400).json({message: 'Bad Request', errors})

    let limit = size
    let offset = size * (page - 1)




    let spots = await Spot.findAll({
        raw:true,
        where,
        limit,
        offset,

    });

    for(const spot of spots){
        //calculating avg rating
        const sum = await Review.sum('stars', {where: { spotId:spot.id } })
        const count = await Review.count({ where: { spotId:spot.id } })
        if(count)
            spot.avgRating = sum/count
        else
            spot.avgRating = 'No reviews yet'

        //adding preview image if applicable
        const spotImage = await SpotImage.findOne({ raw:true, where: { spotId:spot.id, preview:true } })
        if(spotImage){
            spot.previewImage = spotImage.url
        }
        else
            spot.previewImage = 'No preview available'
    }
    return res.json({Spots:spots,page,size})
})

 
router.get('/current', 
    requireAuth, 
    async(req, res) => {
    const { user } = req;

    const userSpots = await Spot.findAll({ raw:true, where:{ ownerId:user.id} })
    
    for(const spot of userSpots){
        //calculating avg rating
        const sum = await Review.sum('stars', {where: { spotId:spot.id } })
        const count = await Review.count({ where: { spotId:spot.id } })
        spot.avgRating = sum/count

        //adding preview image if applicable
        const spotImage = await SpotImage.findOne({ raw:true, where: { spotId:spot.id, preview:true } })
        if(spotImage){
            spot.previewImage = spotImage.url
        }
        else
            spot.previewImage = 'No preview available'
    }

    return res.json({Spots:userSpots})
})

router.get('/:spotId', async (req, res) => {
    const spotDetails = await Spot.findOne({
        raw:true,
        where:{
            id:req.params.spotId
        }
    })

    if(spotDetails){
        // const plainSpotDetails = spotDetails.get({ plain: true });

        const sum = await Review.sum('stars', { where: { spotId:spotDetails.id } });
        const count = await Review.count({ where: { spotId:spotDetails.id } });
        spotDetails.numReviews = count;
        spotDetails.avgStarRating = sum/count;

        spotDetails.SpotImages = await SpotImage.findAll({ 
            where: { spotId:req.params.spotId },
            attributes:{exclude:['spotId','createdAt','updatedAt']}
        })
        spotDetails.Owner = await User.findOne(
            {where:{ id:spotDetails.ownerId},
            attributes:{exclude:['username', 'email', 'hashedPassword', 'createdAt', 'updatedAt']}}
        )
        return res.json(spotDetails);
    }
    else{
        res.status(404)
        return res.json({message: "Spot couldn't be found"})
    }

})

const validateSpot = [
    check("address")
        .exists({ checkFalsy:true })
        .isLength({ min:1, max:100 })
        .withMessage("Street address is required"),
    check("city")
        .exists({ checkFalsy:true })
        .isLength({ min:1, max:100 })
        .withMessage("City is required"),
    check("state")
        .exists({ checkFalsy:true })
        .isLength({ min:1, max:100 })
        .withMessage("State is required"),
    check("country")
        .exists({ checkFalsy:true })
        .isLength({ min:1, max:100 })
        .withMessage("Country is required"),
    check("lat")
        .exists({ checkFalsy:true })
        .isFloat({ min:-90, max:90})
        .withMessage("Latitude must be within -90 and 90"),
    check("lng")
        .exists({ checkFalsy:true })
        .isFloat({ min:-180, max:180})
        .withMessage("Longitude must be within -180 and 180"),
    check("name")
        .exists({ checkFalsy:true })
        .isLength({ min:1, max:50 })
        .withMessage("Name must be less than 50 characters"),
    check("description")
        .exists({ checkFalsy:true })
        .isLength({ min:1, max:120 })
        .withMessage("Description is required"),
    check("price")
        .exists({ checkFalsy:true })
        .isFloat({ min:0 })
        .withMessage("Price per day must be a positive number"),
    handleValidationErrors
]

router.post('/', 
    requireAuth, 
    validateSpot, 
    async (req, res) => {
        const { user } = req;
        const ownerId = user.id
        const { address, city, state, country, lat, lng, name, description, price} = req.body;
        const newSpot = await Spot.create({ ownerId, address, city, state, country, lat, lng, name, description, price})
        res.status(201)
        return res.json(newSpot)
})

router.post('/:spotId/images', 
    requireAuth, 
    async (req, res, next) => {
        const spotId = req.params.spotId;
        const spot = await Spot.findByPk(spotId);
        if(spot){
            const authorized = authorization(req, spot.ownerId);
            if(authorized !== true) 
                return next(authorized)

            const { url, preview } = req.body;
            const newImage = await SpotImage.create({ spotId, url, preview })

            res.status(201);
            return res.json({
                id:newImage.id,
                url:newImage.url,
                preview:newImage.preview
            });
        }
        res.status(404);
        return res.json({message: "Spot couldn't be found"})

})

router.put('/:spotId', 
    requireAuth,
    validateSpot,
    async (req, res, next) => {
        const spot = await Spot.findByPk(req.params.spotId)
        if(spot){
            const authorized = authorization(req, spot.ownerId);
            if(authorized !== true)
                return next(authorized)

            const { address, city, state, country, lat, lng, name, description, price} = req.body;
            spot.set({address, city, state, country, lat, lng, name, description, price});
            spot.save();
            return res.json(spot)

        }
        else{
            res.status(404);
            return res.json({message:"Spot couldn't be found"})
        }
})

router.delete('/:spotId',
    requireAuth,
    async (req, res, next) => {
        const spot = await Spot.findByPk(req.params.spotId);
        if(spot){
            const authorized = authorization(req, spot.ownerId);
            if(authorized !== true)
                return next(authorized)

            spot.destroy();
            return res.json({message:'Successfully deleted'})
        }
        else{
            res.status(404);
            return res.json({message:"Spot couldn't be found"})
        }
    }
)

router.get('/:spotId/reviews', async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId)
    if(spot){
        const reviews = await Review.findAll({
            where: { spotId:req.params.spotId },
            include: [
               {model: User, attributes:['id', 'firstName', 'lastName']},
               {model: ReviewImage, attributes: ['id', 'url']}
            ]
           })
       if(reviews.length > 0)
           return res.json({Reviews:reviews})
       else{
           res.status(404)
           return res.json({message:"No reviews for this spot yet"})
       }
    }
    res.status(404)
    return res.json({message:"Spot couldn't be found"})
    
})

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

router.post('/:spotId/reviews',
    requireAuth,
    validateReview,
    async (req, res) => {
        const spotId = req.params.spotId
        const spot = await Spot.findByPk(spotId)
        if(spot){
            const { user } = req;
            const userId = user.id
            const userReview = await Review.findOne({ 
                where: {
                    spotId:req.params.spotId,
                    userId
                }
            })
            if(userReview){
                res.status(500)
                return res.json({message:'User already has a review for this spot'})
            }
            const { review, stars } = req.body
            const newReview = await Review.create({ userId, spotId, review, stars})
            res.status(201)
            return res.json(newReview)
        }
        res.status(404)
        return res.json({message:"Spot couldn't be found"})
    }
)

router.get('/:spotId/bookings', 
    requireAuth,
    async (req, res) => {
        const spot = await Spot.findByPk(req.params.spotId)
        if(spot){
            if(spot.ownerId === req.user.id){
                const bookings = await Booking.findAll({
                    // raw:true,
                    // nest:true,
                    where:{ spotId:req.params.spotId },
                    include:{
                        model:User,
                        attributes: ['id', 'firstName', 'lastName']
                    }
                })

                for(let booking of bookings){
                    booking = booking.get({raw:true})
                    booking.startDate = booking.startDate.toISOString().split('T')[0]
                    booking.endDate = booking.endDate.toISOString().split('T')[0]
                }

                return res.json({Bookings:bookings})
            }

            const bookings = await Booking.findAll({
                // raw:true,
                // nest:true,
                where:{ spotId:req.params.spotId },
                attributes: ['spotId', 'startDate', 'endDate']
            })

            for(let booking of bookings){
                booking = booking.get({raw:true})
                booking.startDate = booking.startDate.toISOString().split('T')[0]
                booking.endDate = booking.endDate.toISOString().split('T')[0]
            }

            return res.json({Bookings:bookings})
            
        }
        res.status(404)
        return res.json({message:"Spot couldn't be found"})
    }
)


router.post('/:spotId/bookings',
    requireAuth,
    async (req, res) => {

        const todayDate = new Date()
        const start = new Date(req.body.startDate)
        const end = new Date(req.body.endDate)
    
        if(start <= todayDate && start >= end)
            return res.status(400).json({
                message: 'Bad Request',
                errors: { 
                    startDate: 'startDate cannot be in the past',
                    endDate: 'endDate cannot be on or before startDate'
                 }
            })
        if(start <= todayDate){
            return res.status(400).json({
                message: 'Bad Request',
                errors: { startDate: 'startDate cannot be in the past' }
            })
        }
        if(start >= end){
            return res.status(400).json({
                message: 'Bad Request',
                errors: { endDate: 'endDate cannot be on or before startDate' }
            })
        }

        const spotId = parseInt(req.params.spotId)
        const userId = req.user.id
        const spot = await Spot.findByPk(spotId)

        if(spot){
            if(userId !== spot.ownerId){
                const bookings = await Booking.findAll({ where:{ spotId:spotId}})
                
                let bookedStart = false
                let bookedEnd   = false
                let bookedSurround = false
                for(let booking of bookings){
                    if(booking.startDate <= start && booking.endDate >= start)
                        bookedStart = true
                    if(booking.startDate <= end && booking.endDate >= end)
                        bookedEnd = true
                    if(start < booking.startDate && booking.endDate < end)
                        bookedSurround = true
                }

                if(bookedStart && bookedEnd)
                    return res.status(403).json({
                        message: "Sorry, this spot is already booked for the specified dates",
                        errors: {
                          startDate: "Start date conflicts with an existing booking",
                          endDate: "End date conflicts with an existing booking"
                        }
                      })
                if(bookedStart)
                  return res.status(403).json({
                      message: "Sorry, this spot is already booked for the specified dates",
                      errors: {
                        startDate: "Start date conflicts with an existing booking"
                      }
                    })
                if(bookedEnd)
                    return res.status(403).json({
                        message: "Sorry, this spot is already booked for the specified dates",
                        errors: {
                          endDate: "End date conflicts with an existing booking"
                        }
                      })
                if(bookedSurround)
                  return res.status(403).json({
                      message: "Sorry, this spot is already booked for the specified dates",
                      errors: {
                        dates: "Dates surround existing booking"
                      }
                    })
                    

                const { startDate, endDate } = req.body
                let newBooking = await Booking.create({ spotId, userId, startDate, endDate })
                newBooking = newBooking.get({raw:true})
                newBooking.startDate = newBooking.startDate.toISOString().split('T')[0]
                newBooking.endDate = newBooking.endDate.toISOString().split('T')[0]
                
                return res.status(201).json(newBooking)
            }
            return res.status(403).json({message:'Owner cannot book their own spot'})
        }
        
        return res.status(404).json({message:"Spot couldn't be found"})
    }
)


module.exports = router