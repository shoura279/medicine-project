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
const adminRoute =require("./routes/adminRoute")
const userRoute =require("./routes/userRoute")

// ============ Run Server ============
app.listen(5000, "localhost", () => {
  console.log("SERVER IS RUNNING");
});

// // ============ API Routes [EndPoints] ============

app.use("/admin",adminRoute);
app.use("/user",userRoute);

