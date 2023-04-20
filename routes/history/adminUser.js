const router = require("express").Router();
const { query } = require("../../db/connection");
const admin = require("../../middleware/admin");

//get requist for meds
router.get("/", admin, async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      // Query Params
      search = `where id like '%${req.query.search}%'`;
    }
    const data = await query(`select * from requests ${search}`);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ err: err });
  }
});

module.exports = router;
