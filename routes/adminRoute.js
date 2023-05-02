const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const query = require("../db/connection");
const bcrypt = require("bcrypt");
const admin = require("../middleware/admin");
const Category = require("../classes/Category");
const Medicine = require("../classes/Medicine");
const fs = require("fs");
const uplaod = require("../middleware/uploadImage");
const { serialize } = require("v8");
const createMedsSchema = require("../schema/createMeds");
const updateSchema = require("../schema/updateMeds");
const User = require("../classes/User");
const auth = require("../middleware/authorize");
const updateUser = require("../schema/updateUser");
const registerSchema = require("../schema/register");
const crypto = require("crypto");

//======================== create new categry ========================
router.post("/createCategore", admin, async (req, res) => {
  try {
    //check category if exist already
    const checkCategory = await query("select * from categories where name=?", [
      req.body.name,
    ]);
    if (checkCategory.length) {
      return res.status(400).json({
        errors: [{ msg: "category already exits " }],
      });
    }

    // prepare category object
    const categoryObj = new Category(); //(req.body.name, req.body.description);
    if (!req.body.name || !req.body.description)
      return res.status(500).json({
        errors: [{ msg: "feilds cann't be empty" }],
      });
    categoryObj.name = req.body.name;
    categoryObj.description = req.body.description;

    await query("insert into categories set ?", categoryObj);
    res.send("succesfully");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});

//======================== UPDATA CATEGORY ========================
router.patch("/updataCategory/:id", admin, updateSchema, async (req, res) => {
  try {
    // check if category is exist
    const data = await query(
      `select * from categories where id=${req.params.id}`
    );
    if (!data[0]) {
      return res.status(400).json({ errors: [{ msg: "catrgory not found" }] });
    }

    const categoryObj = new Category();
    Object.assign(categoryObj, data[0]);
    // if(req.file){}
    if (req.body.name) {
      categoryObj.name = req.body.name;
    }
    if (req.body.description) {
      categoryObj.description = req.body.description; //description
    }
    //updata data
    await query(`UPDATE categories set ? where id = ?`, [
      categoryObj,
      req.params.id,
    ]);
    res.status(200).json({
      msg: "updated category",
    });
  } catch (err) {
    // console.log(err);
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});

//======================== DELET CATEGORY ========================
router.delete("/deleteCategory/:id", admin, async (req, res) => {
  try {
    // ========= 1-Check is this category is exits
    const data = await query(
      `select * from categories where id = ${req.params.id}`
    );
    if (!data[0]) {
      res.status(404).json({
        errors: [{ msg: "category not found" }],
      });
    }
    // ========= 2-delete category from db
    await query(`delete from categories where id = ?`, [req.params.id]);
    res.status(200).json({
      msg: "deleted category successfully",
    });
  } catch (err) {
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});

//======================== get requist for meds ========================
router.get("/getRequist", admin, async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      // Query Params
      search = `where id like '%${req.query.search}%'`;
    }
    const data = await query(`select * from requests ${search}`);
    for (let i = 0; i < data.length; i++) {
      const arr = await query(
        `select name from medicines where id=${data[i].medicine_id}`
      );
      data[i].meds_name = arr[0].name;
    }
    // console.log(2);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});

//======================== Create Medicine ========================
router.post(
  "/createMedicine",
  admin,
  // add image to folder upload immediately, before any check
  uplaod.single("imageURL"),
  createMedsSchema,

  async (req, res) => {
    try {
      // ========= 1-Vaildation of the structure body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        fs.unlinkSync("./upload/" + req.file.filename);
        // console.log(errors);
        return res.status(400).json({ errors: errors.array() });
      }

      // ========= 2-Vaildation of the image
      if (!req.file) {
        return res.status(400).json({
          errors: [{ msg: "Image is required" }],
        });
      }

      // ========== 3-if the medicine is exits
      const medicinesResult = await query(
        `select * from medicines where name ='${req.body.name}' `
      );
      if (medicinesResult.length > 0) {
        // to delete image from folder upload
        // due [uplaod.single("imageURL")] added image to upload immediately
        fs.unlinkSync("./upload/" + req.file.filename);
        return res.status(400).json({
          errors: [{ msg: "This medicine already exits " }],
        });
      }

      // ========== 4-check the category is exits or not
      const categoryResult = await query(
        `select * from categories where id = '${req.body.category_id}'`
      );
      if (categoryResult.length <= 0) {
        return res.status(400).json({
          errors: [{ msg: "this categroy is not found" }],
        });
      }

      // ========= 5-Prepare the medicine
      const medicineObj = new Medicine(
        req.body.name,
        req.body.description,
        req.body.price,
        req.body.expaire_date,
        req.body.category_id,
        req.file.filename
      );

      // ========= 6-Insert the medicine to db
      await query(`insert into medicines set ?`, medicineObj);

      res.status(200).json({
        msg: "created medicine",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ errors: [{ msg: "someting wrong" }] });
    }
  }
);

//======================== Update Medicine ========================
router.put(
  "/updateMedicine/:id",
  admin,
  uplaod.single("imageURL"),

  updateSchema,

  async (req, res) => {
    try {
      // ========= 1-Vaildation of the name and description
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        fs.unlinkSync("./upload/" + req.file.filename);
        return res.status(400).json({ errors: errors.array() });
      }

      // ========= 2-Check is this medicine is exits
      const medicinesResult = await query(
        `select * from medicines where id = ${req.params.id}`
      );
      if (!medicinesResult[0]) {
        console.log(medicinesResult);
        res.status(404).json({
          errors: [{ msg: "medicine not found" }],
        });
      }

      // ========= 3-Prepare the medicine object
      let medicineObj = new Medicine();
      Object.assign(medicineObj, medicinesResult[0]);

      if (req.file) {
        medicineObj.image_url = req.file.filename;
        fs.unlinkSync("./upload/" + medicinesResult[0].image_url); // to delete old image
      }
      if (req.body.name) {
        medicineObj.name = req.body.name;
      }
      if (req.body.description) {
        medicineObj.description = req.body.description;
      }
      if (req.body.price) {
        medicineObj.price = req.body.price;
      }
      if (req.body.expaire_date) {
        medicineObj.expiration_date = req.body.expaire_date;
      }
      if (req.body.category_id) {
        medicineObj.category_id = req.body.category_id;
      }

      // ========= 4-update the medicine in db
      await query(`update medicines set ? where id = ?`, [
        medicineObj,
        req.params.id,
      ]);

      res.status(200).json({
        msg: "updated medicines",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        errors: [{ msg: "something error" }],
      });
    }
  }
);
//======================== Delete Medicine ========================
router.delete("/deleteMedicine/:id", admin, async (req, res) => {
  try {
    // ========= 1-Check is this medicine is exits
    const medicinesResult = await query(
      `select * from medicines where id = ${req.params.id}`
    );
    if (!medicinesResult[0]) {
      return res.status(404).json({
        errors: [{ msg: "medicine not found" }],
      });
    }

    // ========= 3-delete image from uplaod
    fs.unlinkSync("./upload/" + medicinesResult[0].image_url); // to delete old image

    // ========= 4-delete medicine from db
    await query(`delete from medicines  where id = ?`, [req.params.id]);

    res.status(200).json({
      msg: "deleted medicine successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});
//======================== get all users ========================
router.get("/getallusers", admin, async (req, res) => {
  try {
    const data = await query(`SELECT * from users`);
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
//======================== get sepecific user ========================
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
//======================== create user ========================
router.post("/createuser", registerSchema, async (req, res) => {
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
      msg: "user created successfully",
    });
  } catch (err) {
    res.status(500).json({ err: err });
    console.log(err);
  }
});
//======================== update user ========================
router.put("/updateUser/:id", admin, updateUser, async (req, res) => {
  try {
    // validation of email , password , phone
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const oldData = await query(
      `select * from users WHERE id = ${req.params.id}`
    );
    const userObj = new User();
    Object.assign(userObj, oldData[0]);
    req.body.email
      ? (userObj.email = req.body.email)
      : (userObj.email = oldData[0].email);
    req.body.name
      ? (userObj.name = req.body.name)
      : (userObj.name = oldData[0].name);
    req.body.password
      ? (userObj.password = await bcrypt.hash(req.body.password, 10)) //todo const pass = await bcrypt.hash(req.body.password, 10);
      : (userObj.password = oldData[0].password);
    req.body.phone
      ? (userObj.phone = req.body.phone)
      : (userObj.phone = oldData[0].phone);
    req.body.status
      ? (userObj.status = req.body.status)
      : (userObj.status = oldData[0].status);
    req.body.type
      ? (userObj.type = req.body.type)
      : (userObj.type = oldData[0].type);
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

//======================== delete user ========================
router.delete("/deleteUser/:id", admin, async (req, res) => {
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

//======================== accepts ========================
router.patch("/acceptRequests/:id", admin, async (req, res) => {
  try {
    //check if exist
    const data = await query(`select * from requests where id = ?`, [
      req.params.id,
    ]);
    if (!data[0]) res.status(403).send("not found request");
    // accept requests
    await query(`UPDATE requests SET status = '1' where id = ?`, req.params.id);
    res.json({ msg: "accepted" });
  } catch (err) {
    res.status(500).json({ errors: [{ msg: "someting wrong" }] });
  }
});

// ======================== ignore ========================
router.patch("/ignoreRequests/:id", admin, async (req, res) => {
  try {
    //check if exist
    const data = await query(`select * from requests where id = ?`, [
      req.params.id,
    ]);
    if (!data[0]) res.status(403).send("not found request");
    await query(`UPDATE requests SET status = '2' where id = ?`, req.params.id);
    res.json({ msg: "decline" });
  } catch (err) {
    // console.log(err);
    res.status(500).json({ errors: [{ msg: "someting wrong" }] });
  }
});

//======================== delete ========================
router.delete("/deleteRequests/:id", admin, async (req, res) => {
  try {
    //check if exist
    const data = await query(`select * from requests where id = ?`, [
      req.params.id,
    ]);
    if (!data[0]) res.status(403).send("not found request");
    await query(`delete from requests where id=?`, [req.params.id]);
    res.json({ msg: "deleted" });
  } catch (err) {
    res.status(500).json({ errors: [{ msg: "someting wrong" }] });
  }
});

module.exports = router;
