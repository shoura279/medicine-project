const query = require("../db/connection");

const authrized = async (req, res, next) => {
  const { token } = req.headers;
  const user = await query(`select * from users where token = '${token}'`);
  if (user[0]) {
    res.locals.user = user[0];// to use it in anthor APIs. if that used middleware authorize
    next();
  } else {
    res.status(403).json({
      msg: " you don't have access ",
    });
  }
};

module.exports = authrized;
