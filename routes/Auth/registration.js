const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const query = require("../../db/connection");
const User = require("../../classes/User");
const registerSchema = require("../../schema/register");

router.post("/registr", registerSchema, async (req, res) => {
  try {
    // ========= 1-Vaildation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // ========= 2-Check email if is already exits
    const emailsResult = await query("select * from users where email=?", [
      req.body.email,
    ]);
    if (emailsResult.length > 0) {
      return res.status(400).json({
        errors: [{ msg: "email already exits " }],
      });
    }

    // ========= 3-Prepare object user to save
    const pass = await bcrypt.hash(req.body.password, 10);
    const token = crypto.randomBytes(16).toString("hex");
    const userObj = new User(
      req.body.name,
      req.body.email,
      pass,
      req.body.phone,
      token
    );

    // ========= 4-Insert user object into db
    await query(`insert into users set ? `, userObj);

    res.status(200).json({
      msg: "account created successfully",
    });
  } catch (err) {
    res.status(500).json({ err: err });
    console.log(err);
  }
});

module.exports = router;
