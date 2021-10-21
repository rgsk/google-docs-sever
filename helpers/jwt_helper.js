const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const redisClient = require('./init_redis');
module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      // these fields should be set in either
      // options or payload
      const payload = {
        // aud: userId,
        // exp: Date.now() / 1000 + 60 * 60,
        // iss: 'skartner.com',
      };
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: '1h', // 15s
        issuer: 'skartner.com',
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          return reject(createError.InternalServerError()); // 500 InternalServerError
        }
        resolve(token);
      });
    });
  },
  verifyAccessToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return next(
        createError.Unauthorized('Protected route authorization header not set')
      ); //  401 Unauthorized
      // don't return the message that authorization header not set
      // simply return unauthorized
    }
    const bearerToken = authHeader.split(' ');
    // bearerToken[0] = Bearer
    const token = bearerToken[1];
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        // Error validating the token
        // console.log(err);
        console.log(err.name);
        if (err.name === 'TokenExpiredError') {
          return next(createError.Unauthorized(err.message));
        } else {
          // err.name === 'JsonWebTokenError'
          return next(createError.Unauthorized('Invalid token'));
          // here you should not send err.message
          // it will be like invalid signature
          // the client may use another signature
          // simply send Unauthorized
        }
      }
      req.payload = payload;
      // attach payload to req
      next();
    });
  },
  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: '1y', // 30s
        issuer: 'skartner.com',
        audience: userId,
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          return reject(createError.InternalServerError()); // 500 InternalServerError
        }
        // whenever we generate new refresh token
        // we want to invalidate older refresh tokens
        // so we store this newly generated refresh token
        // in redis
        redisClient.SET(
          userId,
          token,
          'EX',
          365 * 24 * 60 * 60,
          // 30,
          (err, reply) => {
            if (err) {
              console.log(err.message);
              return reject(createError.InternalServerError()); // 500 InternalServerError
            }
            resolve(token);
          }
        );
      });
    });
  },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, payload) => {
          if (err) {
            return reject(
              createError.Unauthorized(
                'Invalid refreshToken exited after jwt validation'
              )
            );
          }
          const userId = payload.aud;
          // after we validated the refresh token
          // through jwt we also need to check
          // that this refresh token is the one
          // set last time, so we retrieve
          // the last saved refresh token from redis db
          // if the refreshToken matches with token from redis
          // we validate the token
          redisClient.GET(userId, (err, result) => {
            if (err) {
              console.log(err.message);
              return reject(
                createError.InternalServerError(
                  `Error while getting refreshToken against ${userId} from database`
                )
              );
            }
            if (refreshToken === result) {
              return resolve(userId);
            }
            return reject(
              createError.Unauthorized(
                "Provided refresh token does't match with refreshToken in Redis, although validated by jwt, new refresh token must be generated"
              )
            );
          });
        }
      );
    });
  },
};
