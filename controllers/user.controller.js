const createHttpError = require('http-errors');
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const { authSchema } = require('../helpers/validation_schema');
module.exports = {
  patchEmail: async (req, res, next) => {
    try {
      const { previousEmail } = req.body;
      delete req.body.previousEmail;
      const result = await authSchema(true, false).validateAsync(req.body);
      // console.log(result);
      const userWithEmail = await User.findOne({ email: result.email });
      if (userWithEmail) {
        throw createHttpError.Conflict(
          `${result.email} is already been registered`
        );
        // 409 Conflict
      }
      await User.findOneAndUpdate(
        {
          email: previousEmail,
        },
        {
          email: result.email,
        }
      );
      res.json({ message: 'Email updated successfully' });
    } catch (err) {
      if (err.isJoi) err.status = 422; //  422 Unprocessable Entity
      next(err);
    }
  },
  patchPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      // console.log(email);
      delete req.body.email;
      const result = await authSchema(false, true).validateAsync(req.body);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(result.password, salt);
      await User.findOneAndUpdate({ email }, { password: hashedPassword });

      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      if (err.isJoi) err.status = 422; //  422 Unprocessable Entity
      next(err);
    }
  },
};
