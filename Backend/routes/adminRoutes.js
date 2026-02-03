import express from "express";
import { getAllAdmissions } from "../controllers/adminControllerAllAdmission.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin → get all admission applications
router.get("/admissions", auth(["admin"]), getAllAdmissions);

export default router;
