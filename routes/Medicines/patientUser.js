const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const Auth = require("../../middleware/authorize");
const fs = require("fs");
const uplaod = require("../../middleware/uploadImage");
const { serialize } = require("v8");
const query = require("../../db/connection");

// view specific medicine
// Show [ Admin and User]
router.get("/:id", async (req, res) => {
  try {
    const medicinesResult = await query("select * from medicines where id = ?", [
      req.params.id,
    ]);

    if (!medicinesResult[0]) {
      res.status(404).json({ errors: [{ msg: "not found medicine " }] });
    } else {
      medicinesResult[0].image_url =
        "http://" + req.hostname + ":5000/" + medicinesResult[0].image_url;

      res.status(200).json(medicinesResult[0]);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});

module.exports = router;
