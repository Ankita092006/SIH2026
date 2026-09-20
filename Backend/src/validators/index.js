const { validate } = require("./validate");
const authValidators = require("./auth.validator");
const commonValidators = require("./common.validator");
const gameValidators = require("./game.validator");
const reminderValidators = require("./reminder.validator");
const memoryValidators = require("./memory.validator");

module.exports = {
  validate,
  ...authValidators,
  ...commonValidators,
  ...gameValidators,
  ...reminderValidators,
  ...memoryValidators
};
