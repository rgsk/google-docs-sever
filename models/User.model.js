const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

UserSchema.pre('save', async function (next) {
  try {
    // console.log('called before saving a user');
    // console.log(this.email);
    // console.log(this.password);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (err) {
    next(err);
  }
});
UserSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
// UserSchema.post('save', async function (next) {
//   console.log('called after saving a user');
// });

const User = mongoose.model('user', UserSchema);
module.exports = User;
