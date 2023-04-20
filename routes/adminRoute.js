const login = require("./Auth/login");
const meds = require("./Medicines/AdminUser");
const categories = require("./category/category");
const history = require("./history/adminUser");
const filter = require("./patient/filterMedicine");
const managePatient = require("./patient/managePatient");
const manegeReq = require("./requests/manegeReq");

module.exports = {
  login,
  meds,
  categories,
  history,
  filter,
  managePatient,
  manegeReq,
};
