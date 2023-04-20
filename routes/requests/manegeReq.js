const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const admin = require("../../middleware/admin");
const Medicine = require("../../classes/Medicine");
const fs = require("fs");
const uplaod = require("../../middleware/uploadImage");
const { serialize } = require("v8");
const query = require("../../db/connection");

//====================accepts
router.patch("/acceptRequests/:id", admin, async (req, res) => {
  try {
    await query(`updata requests set status=1 where id=?`, [req.params.id]);
    res.json({ msg: "accepted" });
  } catch (err) {
    res.status(500).json({ errors: [{ msg: "someting wrong" }] });
  }
});

//======================ignore
router.patch("/ignoreRequests/:id", admin, async (req, res) => {
  try {
    await query(`updata requests set status = 0 where id=?`, [req.params.id]);
    res.json({ msg: "decline" });
  } catch (err) {
    res.status(500).json({ errors: [{ msg: "someting wrong" }] });
  }
});

//========================delete
router.delete("/deleteRequests/:id", admin, async (req, res) => {
  try {
    await query(`delete from requests where id=?`, [req.params.id]);
    res.json({ msg: "deleted" });
  } catch (err) {
    res.status(500).json({ errors: [{ msg: "someting wrong" }] });
  }
});
module.exports = router;
