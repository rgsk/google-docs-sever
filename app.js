require('dotenv').config();
require('./helpers/init_mongodb');

const path = require('path');
const express = require('express');
const createHttpError = require('http-errors');

const app = express();
const assetRoutes = require('./routes/asset.route');
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

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/assets', assetRoutes);
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
