require('dotenv').config();
require('./helpers/init_mongodb');

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const createHttpError = require('http-errors');
const assetRoute = require('./routes/asset.route');
const authRoute = require('./routes/auth.route');
const userRoute = require('./routes/user.route');
const { verifyAccessToken } = require('./helpers/jwt_helper');
const app = express();
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.get('/', verifyAccessToken, (req, res, next) => {
  // console.log(req.headers['authorization']);
  // console.log(req.payload); // this attached after jwt verification
  res.send('Hello from express');
});
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/auth', authRoute);
app.use('/assets', assetRoute);
app.use('/user', userRoute);
app.use((req, res, next) => {
  next(createHttpError.NotFound());
});
app.use((err, req, res, next) => {
  console.log('!!!!!!!!!!!!!!!!!!!!!');
  console.log('Error: ' + err.message);
  console.log('!!!!!!!!!!!!!!!!!!!!!');
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () =>
  console.log(`Server running on: ${PORT}`)
);

require('./helpers/init_socket')(server);
