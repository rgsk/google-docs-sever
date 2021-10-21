const createHttpError = require('http-errors');
const User = require('../models/User.model');
const { authSchema } = require('../helpers/validation_schema');
const redisClient = require('../helpers/init_redis');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../helpers/jwt_helper');
module.exports = {
  register: async (req, res, next) => {
    try {
      const result = await authSchema(true, true).validateAsync(req.body);
      // console.log(result);
      const userWithEmail = await User.findOne({ email: result.email });
      if (userWithEmail) {
        throw createHttpError.Conflict(
          `${result.email} is already been registered`
        );
        // 409 Conflict
      }
      const user = new User(result);
      const savedUser = await user.save();
      const accessToken = await signAccessToken(savedUser.id);
      const refreshToken = await signRefreshToken(savedUser.id);
      res.send({ accessToken, refreshToken });
    } catch (err) {
      if (err.isJoi) err.status = 422; //  422 Unprocessable Entity
      next(err);
    }
  },
  login: async (req, res, next) => {
    try {
      const result = await authSchema(true, true).validateAsync(req.body);
      const user = await User.findOne({ email: result.email });
      if (!user) throw createHttpError.NotFound('User not registered'); // 404 Not Found
      const isMatch = await user.isValidPassword(result.password);
      if (!isMatch)
        throw createHttpError.Unauthorized('Username/Password not valid');
      // 401 Unauthorized
      const accessToken = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);
      res.send({ accessToken, refreshToken });
    } catch (err) {
      if (err.isJoi)
        return next(createHttpError.BadRequest('Invalid Username/Password'));
      // 400 Bad Request
      next(err);
    }
  },
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createHttpError.BadRequest(); // 400 Bad Request
      const userId = await verifyRefreshToken(refreshToken);
      const accessToken = await signAccessToken(userId);
      const newRefreshToken = await signRefreshToken(userId);
      res.send({ accessToken, refreshToken: newRefreshToken });
    } catch (err) {
      next(err);
    }
  },
  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw createHttpError.BadRequest();
      }
      const userId = await verifyRefreshToken(refreshToken);
      redisClient.DEL(userId, (err, val) => {
        if (err) {
          console.log(err.message);
          throw createHttpError.InternalServerError(
            'Redis error while deleting refreshToken from redis db'
          );
          // these error messages are for demonstration purpose
        }
        console.log(val);
        res.sendStatus(204);
        // 204 No Content
        // no content to return but request successful
      });
    } catch (err) {
      next(err);
    }
  },
};
// on the client side
// when we logout we need to delete accessToken and
// refreshToken
