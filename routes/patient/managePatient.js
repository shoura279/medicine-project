const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const { query } = require("../../db/connection");
const User = require("../../classes/User");
const admin = require("../../middleware/admin");
const auth = require("../../middleware/authorize");
const updateUser = require("../../schema/updateUser");

// get sepecific user
router.get("/getSepecificUser/:id", admin, async (req, res) => {
  try {
    const data = await query(`SELECT * from users where id = ${req.params.id}`);
    if (data.length == 0) {
      res.status(404).json({
        msg: "patient not found",
      });
      return;
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});

// update user
router.put("/updateUser/:id",admin, updateUser, async (req, res) => {
  try {
    // validation of email , password , phone
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const userObj = new User();
    if (req.body.email) {
      userObj.email = req.body.email;
    }
    if (req.body.password) {
      userObj.password = req.body.password
    }
    if (req.body.phone) {
      userObj.phone = req.body.phone
    }
    if (req.body.status) {
      userObj.status = req.body.status;
    }
    if (req.body.type) {
      userObj.type = req.body.type
    }

    await query(`UPDATE users SET ? WHERE id = ${req.params.id} `, userObj);
    res.status(200).json({
      msg: "updated successfully",
    });

  } catch (err) {
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});

// delete user
router.delete("/deleteUser/:id",admin, async (req, res) => {
  try {
    const data = await query(
      `select id from users WHERE id = ${req.params.id}`
    );
    if (data.length == 0) {
      res.status(404).json({
        msg: "id not found",
      });
      return;
    }
    await query(`DELETE FROM users WHERE id = ${req.params.id}`);
    res.status(200).json({
      msg: "user deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});

module.exports = router;
