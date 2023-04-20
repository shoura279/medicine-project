const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const query = require("../../db/connection");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//Login
router.post("/login",
  body("email").isEmail().withMessage("Enter a vaild email!"), // Email's constrains

  async (req, res) => {
    try {
      // ========= 1-Vaildation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // ========= 2-Check email if is already exits
      const userRecordResult = await query(
        `select * from users where email='${req.body.email}'`
      );
      if (userRecordResult.length == 0) {
        return res.status(404).json({
          errors: [{ msg: "Email not exits " }],
        });
      }

      // ========= 3-Check password with compare
      const checkPassword = await bcrypt.compare(
        req.body.password,
        userRecordResult[0].password
      );
      if (!checkPassword) {
        return res.status(404).json({
          errors: [{ msg: "worng password" }],
        });
      } else {
        delete userRecordResult[0].password;
        return res.status(200).json(userRecordResult[0]);
      }
    } catch (err) {
      res.status(500).json({ err: err });
    }
  }
);

module.exports = router;
