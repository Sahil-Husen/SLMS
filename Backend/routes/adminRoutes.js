import express from "express";
import {
  getAllAdmissions,
  validateAdmissions,
  assignMeritRanks,
  selectStudents,
  getSelectedStudents,
  getGroupedMeritList
} from "../controllers/adminControllerAllAdmission.js";

import {
  createCourse,
  updateCourseSeats,
  getCourses,
  getCoursesByDepartment,
} from "../controllers/adminCourseAndSeat.js";

import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Admission Related Controllers */

// Admin → get all admission applications
router.get("/admissions", auth(["admin"]), getAllAdmissions);

//Validating the admissions
router.get("/admissions/validate", auth(["admin"]), validateAdmissions);
//Generate Merit list
router.get("/merit-list", auth(["admin"]), getGroupedMeritList);

//Select students based on cutoff
router.post("/select-students", auth(["admin"]), selectStudents);

//Get final Selected Students
router.get("/selected-students", auth(["admin"]), getSelectedStudents);

// Get coursewise Departments
router.get(
  "/courses/department/:departmentId",
  auth(["admin", "student"]),
  getCoursesByDepartment,
);



/* here Admin Create Course Get Seats related work is going to done */

router.post("/course", auth(["admin"]), createCourse);
router.get("/courses", auth(["admin"]), getCourses);
router.put("/course/:id/seats", auth(["admin"]), updateCourseSeats);

export default router;
