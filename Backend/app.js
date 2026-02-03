import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from 'cors';
import  connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import adminAuthRoute from "./routes/adminAuthRoutes.js"



const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());
// app.use(
//   cors({
//     origin: "http://localhost:5173", 
//     credentials: true, 
//   }),
// );
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


connectDB();


// Auth Routes integration
app.use("/api/auth",authRoutes)

//Admin Routes

app.use("/api/admin",adminAuthRoute);

app.use("/api/admin", adminRoutes);



app.get("/", (req, res) => {
    res.json({
      message: "hi from  server",
    });
  }).listen(PORT, () => {
    console.log(`Server is running on ${PORT} `);
  });
