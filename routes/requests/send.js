const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const authorize = require("../../middleware/authorize");
const Request = require("../../classes/Request");
const fsthorize = require("fs");
const uplaod = require("../../middleware/uploadImage");
const { serialize } = require("v8");
const query = require("../../db/connection");

//=================send request
router.post("/sendRequests", authorize, async (req, res) => {
  try {
    const requestObj = new Request();
    requestObj.status = 0;
    requestObj.user_id = req.body.userId;
    requestObj.medicine_id = req.body.medicineId;

    await query(`insert into requests set ?`, requestObj);

    res.status(200).json({
      msg: "request added",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: "someting wrong" }] });
  }
});
module.exports = router;
