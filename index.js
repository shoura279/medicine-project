// ============ Initialize Express ============
const express = require("express");
const app = express();

// ============ Global Middleware ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("upload"));
const cors = require("cors");
app.use(cors());

// // ============ Required Modules ============
const registration = require("./routes/Auth/registration");
const login = require("./routes/Auth/login");
const manageMeds = require("./routes/Medicines/AdminUser");
const patientUserMeds = require("./routes/Medicines/patientUser");


// ============ Run Server ============
app.listen(5000, "localhost", () => {
  console.log("SERVER IS RUNNING");
});

// // ============ API Routes [EndPoints] ============
app.use("/register", registration);
app.use("/admin/createUser", registration);

app.use("/login", login);
app.use("/catgory/medicine", manageMeds)
app.use("/catgory/medicine", patientUserMeds)
