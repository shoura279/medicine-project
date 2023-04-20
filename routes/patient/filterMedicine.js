const router = require("express").Router();
const { query } = require("../../db/connection");

router.get("/filterMedicine", async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      // Query Params
      search = `where name like '%${req.query.search}%'`;
    }
    const result = await query(`select * from medicines ${search}`);
    if (result.length == 0) {
      res.status(404).json({
        msg: "medicine not found",
      });
      return;
    }
    result.map((meds) => {
      meds.img_url = "http://" + req.hostname + ":5000/" + meds.img_url;
    });
    
    res.status(200).json(result);

  } catch (err) {
    res.status(500).json({
      errors: [{ msg: "something error" }],
    });
  }
});

module.exports = router;