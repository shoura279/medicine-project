const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../classes/User");
const registerSchema = require("../schema/register");
const query = require("../db/connection");
const Category = require("../classes/Category");
const auth = require("../middleware/authorize");
const fs = require("fs");
const uplaod = require("../middleware/uploadImage");
const { serialize } = require("v8");
const authorize = require("../middleware/authorize");
const Request = require("../classes/Request");
const fsthorize = require("fs");

//======================== get requist for meds ========================
router.get("/getRequist/:id", auth, async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      // Query Params
      search = `where id like '%${req.query.search}%'`;
    }
    const data = await query(`select * from requests ${search}`);
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});

//======================== send request ========================
router.post("/sendRequests", authorize, async (req, res) => {
  try {
    const requestObj = new Request();
    requestObj.status = 0;
    requestObj.user_id = req.body.user_id;
    requestObj.medicine_id = req.body.medicine_id;

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
