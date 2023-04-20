const query = require("../db/connection");

const admin = async (req, res, next) => {
  const { token } = req.headers;
  const user = await query(`select type from users where token = '${token}'`);
  if (user.length == 0 || user[0].type == 0 ) {
    res.status(403).json({
      msg: " you don't have access ",
    });
  } else {
    next();
  }
};

module.exports = admin;