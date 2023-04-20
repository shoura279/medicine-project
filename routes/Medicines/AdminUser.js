const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const Admin = require("../../middleware/admin");
const Medicine = require("../../classes/Medicine");
const fs = require("fs");
const uplaod = require("../../middleware/uploadImage");
const { serialize } = require("v8");
const query = require("../../db/connection");

const createMedsSchema = require("../../schema/createMeds");
const updateSchema = require("../../schema/updateMeds");

//===============Create Medicine
router.post( "/createMedicine",
  Admin,

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

//=====================Update Medicine
router.put("/updateMedicine/:id",
  Admin,
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
      console.log(err);
      res.status(500).json({
        errors: [{ msg: "something error" }],
      });
    }
  }
);

//========================================Delete Medicine
router.delete("deleteMedicine/:id", Admin, async (req, res) => {
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


module.exports = router;
