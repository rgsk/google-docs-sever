const createHttpError = require('http-errors');
const fs = require('fs');
const Asset = require('../models/Asset');
exports.getAsset = async (req, res, next) => {
  const id = req.params.id;
  try {
    let asset = await Asset.findById(id);
    res.status(200).json({
      message: 'Fetched Asset successfully',
      asset,
    });
  } catch (err) {
    next(err);
  }
};

exports.createAsset = async (req, res, next) => {
  // console.log(req.file);
  if (!req.file) {
    const error = createHttpError.UnprocessableEntity('Image not provided');
    return next(error);
  }
  const imageUrl = req.file.path.replace('\\', '/');
  try {
    const createdAsset = await new Asset({
      type: 'image',
      value: imageUrl,
    });
    createdAsset.save();
    res.status(201).json({
      message: 'Asset created successfully',
      asset: createdAsset,
    });
  } catch (err) {
    next(err);
  }
};
exports.deleteAsset = async (req, res, next) => {
  const value = req.body.value;
  fs.unlink(value, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Deleted file: ${value}`);
  });
  try {
    await Asset.deleteOne({
      value,
    });
    res.status(200).json({
      message: 'Deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
