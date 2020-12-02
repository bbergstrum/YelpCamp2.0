const Joi = require('joi');

module.exports.campgroundSchema = Joi.object({
    // check that campground is an object and is required
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});
