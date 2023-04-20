const router = require("express").Router();
const { query } = require("../../db/connection");
const auth = require("../../middleware/authorize");

//get requist for meds
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

module.exports = router;
