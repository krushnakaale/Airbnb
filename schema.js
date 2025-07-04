const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(), // spelling corrected
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string()
      .uri()
      .allow("") // ✅ allow empty string as valid input
      .empty("") // ✅ treat empty string as undefined
      .default(
        "https://t3.ftcdn.net/jpg/00/29/13/38/360_F_29133877_bfA2n7cWV53fto2BomyZ6pyRujJTBwjd.jpg"
      ),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});
