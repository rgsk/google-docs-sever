const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const assetSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model('Asset', assetSchema);
