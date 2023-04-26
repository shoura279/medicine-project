const { body } = require("express-validator");

const schema = [
  body("name").isString().withMessage("Please enter a vaild medicine name"),

  body("description")
    .isString()
    .withMessage("Please Enter a valid medicine description"),

  body("price").isNumeric().withMessage("Please enter a valid price"),

  body("expaire_date")
    .isDate()
    .withMessage("Please enter a vaild expaire date"),

  body("category_id")
    .isNumeric()
    .withMessage("Please enter a vaild category_id"),
];

module.exports = schema;
