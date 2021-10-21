const Joi = require('@hapi/joi');
const authSchema = (validateEmail, validatePassword) =>
  Joi.object({
    email: validateEmail && Joi.string().email().lowercase().required(),
    password: validatePassword && Joi.string().min(2).required(),
  });

module.exports = {
  authSchema,
};
