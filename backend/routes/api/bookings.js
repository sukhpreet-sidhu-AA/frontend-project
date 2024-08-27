const express = require('express');
const router = express.Router();
const { Spot, Review, SpotImage, User, ReviewImage, Booking } = require('../../db/models')
const { requireAuth, authorization } = require('../../utils/auth');
const { Op } = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

router.get('/current', 
    requireAuth,
    async (req, res) => {
        const { user } = req
        const bookings = await Booking.findAll({
            // raw:true,
            // nest:true,
            where:{ userId:user.id },
            include:{ model:Spot, attributes:{ exclude: ['createdAt', 'updatedAt']}}
        })
        
        for(let booking of bookings){
            booking = booking.get({raw:true})
            booking.startDate = booking.startDate.toISOString().split('T')[0]
            booking.endDate = booking.endDate.toISOString().split('T')[0]
        }

        for(let booking of bookings){
            const spotImage = await SpotImage.findOne({ where: { spotId:booking.Spot.id, preview:true } })
            if(spotImage)
                booking.Spot.previewImage = spotImage.url
            else
                booking.Spot.previewImage = 'No preview available'
        }

        return res.json({Bookings:bookings})
    }
)

router.put('/:bookingId',
    requireAuth,
    async (req, res, next) => {
        const todayDate = new Date()
        const startDate = new Date(req.body.startDate)
        const endDate = new Date(req.body.endDate)
    
        if(startDate <= todayDate && startDate >= endDate)
            return res.status(400).json({
                message: 'Bad Request',
                errors: { 
                    startDate: 'startDate cannot be in the past',
                    endDate: 'endDate cannot be on or before startDate'
                 }
            })
        if(startDate <= todayDate){
            return res.status(400).json({
                message: 'Bad Request',
                errors: { startDate: 'startDate cannot be in the past' }
            })
        }
        if(startDate >= endDate){
            return res.status(400).json({
                message: 'Bad Request',
                errors: { endDate: 'endDate cannot be on or before startDate' }
            })
        }

        let booking = await Booking.findByPk(req.params.bookingId)
        
        
        if(booking){

            const authorized = authorization(req, booking.userId);
            if(authorized !== true)
                return next(authorized)

            if(booking.endDate <= todayDate)
                    return res.status(403).json({message:"Past booking can't be modified"})

            const spotId = booking.spotId
            const bookings = await Booking.findAll({ where:{ spotId:spotId}})
            
            let bookedStart = false
            let bookedEnd   = false
            let bookedSurround = false
            for(let booking of bookings){
                if(booking.startDate <= startDate && booking.endDate >= startDate)
                    bookedStart = true
                if(booking.startDate <= endDate && booking.endDate >= endDate)
                    bookedEnd = true
                if(startDate < booking.startDate && booking.endDate < endDate)
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
            
            booking.set({ startDate, endDate })
            booking.save
            booking = booking.get({raw:true})
            booking.startDate = booking.startDate.toISOString().split('T')[0]
            booking.endDate = booking.endDate.toISOString().split('T')[0]
            return res.json(booking)
        }

        return res.status(404).json({ message:"Booking couldn't be found" })
    }
)

router.delete('/:bookingId', 
    requireAuth,
    async (req, res) => {
        const booking = await Booking.findByPk(req.params.bookingId)
        if(booking)
        {
            const spot = await Spot.findByPk(booking.spotId)
            if(booking.userId === req.user.id || spot.ownerId === req.user.id){
                const todayDate = new Date()
                if(booking.startDate >= todayDate){
                    booking.destroy()
                    return res.json({message:"Successfully deleted"})
                }
                return res.status(403).json({message:"Bookings that have been started can't be deleted"})
            }
            return res.status(403).json({message:"Booking must belong to the user or the Spot must belong to the user"})
        }
        return res.status(404).json({message:"Booking couldn't be found"})
    }
)



module.exports = router