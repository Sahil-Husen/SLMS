import express from "express";
import {
  createDepartment,
  getDepartments,
  getDepartmentsByFaculty,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";

import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin Department CRUD
router.post("/department", auth(["admin"]), createDepartment);
router.get("/departments", auth(["admin"]), getDepartments);
router.get(
  "/faculty/:facultyId/departments",
  auth(["admin"]),
  getDepartmentsByFaculty,
);
router.put("/department/:id", auth(["admin"]), updateDepartment);
router.delete("/department/:id", auth(["admin"]), deleteDepartment);

export default router;
