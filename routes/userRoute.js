const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../classes/User");
const registerSchema = require("../schema/register");
const { query } = require("../db/connection");
const Category = require("../classes/Category");
const auth = require("../middleware/authorize");
const fs = require("fs");
const uplaod = require("../middleware/uploadImage");
const { serialize } = require("v8");
const authorize = require("../middleware/authorize");
const Request = require("../classes/Request");
const fsthorize = require("fs");

// // //======================== Login ========================
// // router.post(
// //   "/login",
// //   body("email").isEmail().withMessage("Enter a vaild email!"), // Email's constrains

// //   async (req, res) => {
// //     try {
// //       // ========= 1-Vaildation
// //       const errors = validationResult(req);
// //       if (!errors.isEmpty()) {
// //         return res.status(400).json({ errors: errors.array() });
// //       }

// //       // ========= 2-Check email if is already exits
// //       const userRecordResult = await query(
// //         `select * from users where email='${req.body.email}'`
// //       );
// //       if (userRecordResult.length == 0) {
// //         return res.status(404).json({
// //           errors: [{ msg: "Email not exits " }],
// //         });
// //       }

// //       // ========= 3-Check password with compare
// //       const checkPassword = await bcrypt.compare(
// //         req.body.password,
// //         userRecordResult[0].password
// //       );
// //       if (!checkPassword) {
// //         return res.status(404).json({
// //           errors: [{ msg: "worng password" }],
// //         });
// //       } else {
// //         delete userRecordResult[0].password;
// //         return res.status(200).json(userRecordResult[0]);
// //       }
// //     } catch (err) {
// //       res.status(500).json({ err: err });
// //     }
// //   }
// // );

// //======================== registr ========================
// router.post("/registr", registerSchema, async (req, res) => {
//   try {
//     // ========= 1-Vaildation
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     // ========= 2-Check email if is already exits
//     const emailsResult = await query("select * from users where email=?", [
//       req.body.email,
//     ]);
//     if (emailsResult.length > 0) {
//       return res.status(400).json({
//         errors: [{ msg: "email already exits " }],
//       });
//     }

//     // ========= 3-Prepare object user to save
//     const pass = await bcrypt.hash(req.body.password, 10);
//     const token = crypto.randomBytes(16).toString("hex");
//     const userObj = new User(
//       req.body.name,
//       req.body.email,
//       pass,
//       req.body.phone,
//       token
//     );

//     // ========= 4-Insert user object into db
//     await query(`insert into users set ? `, userObj);

//     res.status(200).json({
//       msg: "account created successfully",
//     });
//   } catch (err) {
//     res.status(500).json({ err: err });
//     console.log(err);
//   }
// });

// //======================== get all category or specific ========================
// router.get("/getCategore", async (req, res) => {
//   try {
//     let search = "";
//     if (req.query.search) {
//       // Query Params
//       search = `where name like '%${req.query.search}%'`;
//     }
//     const data = await query(`select * from categories ${search}`);
//     res.status(200).json(data);
//   } catch (err) {
//     res.status(500).json({
//       errors: [{ msg: "something error" }],
//     });
//   }
// });

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
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});

// // ======================== view specific medicine ========================
// //======================== Show [ Admin and User] ========================
// router.get("/:id", async (req, res) => {
//   try {
//     const medicinesResult = await query(
//       "select * from medicines where id = ?",
//       [req.params.id]
//     );

//     if (!medicinesResult[0]) {
//       res.status(404).json({ errors: [{ msg: "not found medicine " }] });
//     } else {
//       medicinesResult[0].image_url =
//         "http://" + req.hostname + ":5000/" + medicinesResult[0].image_url;

//       res.status(200).json(medicinesResult[0]);
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       errors: [{ msg: "something error" }],
//     });
//   }
// });

// //======================== filter ========================
// router.get("/filterMedicine", async (req, res) => {
//   try {
//     let search = "";
//     if (req.query.search) {
//       // Query Params
//       search = `where name like '%${req.query.search}%'`;
//     }
//     const result = await query(`select * from medicines ${search}`);
//     if (result.length == 0) {
//       res.status(404).json({
//         msg: "medicine not found",
//       });
//       return;
//     }
//     result.map((meds) => {
//       meds.img_url = "http://" + req.hostname + ":5000/" + meds.img_url;
//     });

//     res.status(200).json(result);
//   } catch (err) {
//     res.status(500).json({
//       errors: [{ msg: "something error" }],
//     });
//   }
// });

//======================== send request ========================
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