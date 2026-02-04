import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
    createAttendance,
    updateStudentAttendance,
    getMyAttendance,
} from "../controllers/AttendanceController.js";

const router = express.Router();

// Faculty routes
router.post("/create", auth(["faculty"]), createAttendance);
router.patch("/update/:attendanceId/student/:studentId", auth(["faculty"]), updateStudentAttendance);

// Student routes
router.get("/me", auth(["student"]), getMyAttendance);

export default router;
