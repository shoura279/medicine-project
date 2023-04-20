const login = require("./Auth/login");
const register = require("./Auth/registration");
const meds = require("./Medicines/patientUser");
const categories = require("./category/category");
const history = require("./history/patientUser");
const filter = require("./patient/filterMedicine");
const manegeReq = require("./requests/send");

module.exports = {
  login,
  register,
  meds,
  categories,
  history,
  filter,
  manegeReq,
};
