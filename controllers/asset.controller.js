const createHttpError = require('http-errors');
const fs = require('fs');
const Asset = require('../models/Asset.model');
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
  // console.log(value);

  try {
    fs.unlink(value, (err) => {
      if (err) {
        console.error(err);
      }
      // console.log(`Deleted file: ${value}`);
      const directory = value.split('\\')[0];
      fs.readdir(directory, (err, files) => {
        if (err) {
          console.error(err);
        }
        // console.log(files);
        if (files && files.length === 0) {
          fs.rmdir(directory, () => {
            // console.log('Deleted directory: ' + directory);
          });
        }
      });
    });

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
