const { body } = require("express-validator");


const schema = [
  body("name").custom(() => {
    if (body("name").isString() || body("name").isEmpty()) {
      return "valid";
    } else {
      throw new Error("name is not a valid");
    }
  }),
  body("description").custom(() => {
    if (body("description").isString() || body("description").isEmpty()) {
      return "valid";
    } else {
      throw new Error("description is not a valid");
    }
  }),

  body("price").custom(() => {
    if (body("price").isNumeric() || body("price").isEmpty()) {
      return "valid";
    } else {
      throw new Error("price is not a valid");
    }
  }),
  body("category_id").custom(() => {
    if (body("category_id").isNumeric() || body("category_id").isEmpty()) {
      return "valid";
    } else {
      throw new Error("category_id is not a valid");
    }
  }),
  body("expaire_date").custom(() => {
    if (body("expaire_date").isDate() || body("expaire_date").isEmpty()) {
      return "valid";
    } else {
      throw new Error("expaire_date is not a valid");
    }
  }),
];

module.exports = schema;
