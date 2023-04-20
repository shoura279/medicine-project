const mysql = require("mysql");
const { promisify } = require("util");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "meds",
});

connection.connect((err) => {
  if (err) {
    console.error("ERROR Connecting");
    return;
  }

  console.log("CONNECTION Successfully");
});

module.exports = promisify(connection.query).bind(connection);
