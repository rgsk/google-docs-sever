const express = require('express');

const router = express.Router();
const uploadFile = require('../helpers/uploadFile');

const assetController = require('../controllers/asset.controller');

router.post('/', uploadFile, assetController.createAsset);

router.get('/:id', assetController.getAsset);
router.delete('/', assetController.deleteAsset);
module.exports = router;
