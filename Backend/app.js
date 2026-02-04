import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

//  MIDDLEWARE (ORDER MATTERS)
app.use(
  express.json({
    type: ["application/json", "application/vnd.api+json"],
  }),
);
app.use(express.urlencoded({ extended: true }));


app.use(cors());

// DB
connectDB();

//  ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", facultyRoutes);
app.use("/api/admin", departmentRoutes);

// this api end point will provide all the admission
app.use("/api/admissions", admissionRoutes);
app.use("/api/attendance", attendanceRoutes);

//  HEALTH CHECK
app.get("/", (req, res) => {
  res.json({ message: "hi from server" });
});

//  START SERVER (VERY IMPORTANT)
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
