const router = require("express").Router();
const { query } = require("../../db/connection");
const admin = require("../../middleware/admin");
const Category = require("../../classes/Category");

const updateSchema = require("../../schema/updateMeds");
const { body } = require("express-validator");

//===============get all category or specific
router.get("/getCategore", async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      // Query Params
      search = `where name like '%${req.query.search}%'`;
    }
    const data = await query(`select * from categories ${search}`);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});

//============create new categry
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
    const categoryObj = new Category(req.body.name, req.body.description);

    await query("insert into categories set ?", categoryObj);
    res.send("succesfully");
  } catch (err) {
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});

//==============UPDATA CATEGORY
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

//============DELET CATEGORY
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
module.exports = router;
