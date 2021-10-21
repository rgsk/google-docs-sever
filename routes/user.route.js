const express = require('express');
const createHttpError = require('http-errors');
const router = express.Router();
const { patchEmail, patchPassword } = require('../controllers/user.controller');
router.patch('/', (req, res, next) => {
  const { updateEmail, updatePassword } = req.body;
  if (updatePassword) {
    delete req.body.updatePassword;
    // joi raises error if req.body
    // contains field other than those
    // which are validated so we must remove them
    return patchPassword(req, res, next);
  }

  if (updateEmail) {
    delete req.body.updateEmail;
    return patchEmail(req, res, next);
  }

  next(
    createHttpError.UnprocessableEntity('Neither email nor password provided')
  );
});
module.exports = router;
