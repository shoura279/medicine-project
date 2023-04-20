const { body } = require("express-validator");

const schema = [
  body("email").isEmail().withMessage("Enter a vaild email!"), // Email's constrains

  body("name") // Name's constrains
    .isString()
    .withMessage("enter a vaild name")
    .isLength({ min: 10, max: 20 })
    .withMessage("please enter name between 10-20"),

  body("password")
    .isString()
    .withMessage("Please enter string password") // Password's constrains
    .isLength({ min: 8, max: 12 })
    .withMessage("enter password between 8-12"),

  body("phone").isMobilePhone().withMessage("Please enter a vaild phone"),
];

module.exports = schema;
