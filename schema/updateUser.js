const { body } = require("express-validator");


const schema = [
  body("email").custom(() => {
    if (body("email").isAlpha() || body("email").isEmpty()) {
      return "valid";
    } else {
      throw new Error("email is not a valid");
    }
  }),
  body("password").custom(() => {
    if (body("password").isString() || body("password").isEmpty()) {
      return "valid";
    } else {
      throw new Error("password is not a valid");
    }
  }),

  body("phone").custom(() => {
    if (body("phone").isNumeric() || body("phone").isEmpty()) {
      return "valid";
    } else {
      throw new Error("phone is not a valid");
    }
  }),

];

module.exports = schema;
