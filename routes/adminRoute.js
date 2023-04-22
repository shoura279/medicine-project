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
    categoryObj.name = req.body.name;
    categoryObj.description = req.body.description;

    await query("insert into categories set ?", categoryObj);
    res.send("succesfully");
  } catch (err) {
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});

//======================== UPDATA CATEGORY ========================
router.patch("/updataCategory/:id", updateSchema, admin, async (req, res) => {
  try {
    // check if category is exist
    const data = await query(
      `select * from categories where id=${req.params.id}`
    );
    if (!data[0]) {
      res.status(400).json({ errors: [{ msg: "catrgory not found" }] });
    }

    const categoryObj = new Category();
    if (req.body.name) {
      categoryObj.name = req.body.name;
    }
    if (req.body.description) {
      categoryObj.description = req.body.description;
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
    const userObj = {
      name: req.body.name ? req.body.name : oldData[0].name,
      email: req.body.email ? req.body.email : oldData[0].email,
      password: req.body.password ? req.body.password : oldData[0].password,
      phone: req.body.phone ? req.body.phone : oldData[0].phone,
      status: req.body.status ? req.body.status : oldData[0].status,
      type: req.body.type ? req.body.type : oldData[0].type,
      token: req.body.token ? req.body.token : oldData[0].token,
    };

    // const userObj = new User();
    // if (req.body.email) {
    //   userObj.email = req.body.email;
    // }else{
    //   userObj.email = oldData[0].email;
    // }
    // if (req.body.password) {
    //   userObj.password = req.body.password;
    // }else{
    //   userObj.password = oldData[0].password;
    // }
    // if (req.body.phone) {
    //   userObj.phone = req.body.phone;
    // }else{
    //   userObj.phone =oldData[0].phone;
    // }
    // if (req.body.status) {
    //   userObj.status = req.body.status;
    // }else{
    //   userObj.status = oldData[0].status;
    // }
    // if (req.body.type) {
    //   userObj.type = req.body.type;
    // }else{
    //   userObj.type = oldData[0].type;
    // }

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
    await query(`UPDATE requests SET status = '1' where id = ?`, req.params.id);
    res.json({ msg: "accepted" });
  } catch (err) {
    res.status(500).json({ errors: [{ msg: "someting wrong" }] });
  }
});

// ======================== ignore ========================
router.patch("/ignoreRequests/:id", admin, async (req, res) => {
  try {
    await query(`UPDATE requests SET status = '0' where id = ?`, req.params.id);
    res.json({ msg: "decline" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: "someting wrong" }] });
  }
});

//======================== delete ========================
router.delete("/deleteRequests/:id", admin, async (req, res) => {
  try {
    await query(`delete from requests where id=?`, [req.params.id]);
    res.json({ msg: "deleted" });
  } catch (err) {
    res.status(500).json({ errors: [{ msg: "someting wrong" }] });
  }
});

module.exports = router;
