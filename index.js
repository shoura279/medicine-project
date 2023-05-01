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
const adminRoute = require("./routes/adminRoute");
const userRoute = require("./routes/userRoute");
const shared = require("./routes/shared");
// ============ Run Server ============
app.listen(5000, "localhost", () => {
  console.log("SERVER IS RUNNING");
});

// // ============ API Routes [EndPoints] ============

app.use("/meds/admin", adminRoute);
app.use("/meds/user", userRoute);
app.use("/meds", shared);
