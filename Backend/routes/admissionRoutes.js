import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
  createAdmissionApplication,
  assignMeritRanks,
  selectStudents,
} from "../controllers/AdmissionApplication.js";

const router = express.Router();

// Student
router.post("/apply", auth(["student"]), createAdmissionApplication);

// Admin
router.post("/assign-merit", auth(["admin"]), assignMeritRanks);
router.post("/select-students", auth(["admin"]), selectStudents);

export default router;
