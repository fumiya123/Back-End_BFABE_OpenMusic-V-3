const Joi = require('joi');

const UserPayloadSchema = Joi.object({
    username: Joi.string().min(1).max(50).required(),
    password: Joi.string().required(),
    fullname: Joi.string().required(),
});

module.exports = { UserPayloadSchema };
