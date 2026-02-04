import express from "express";
import {
  createFaculty,
  getFaculties,
  updateFaculty,
  deleteFaculty
} from "../controllers/facultyController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/faculty", auth(["admin"]), createFaculty);
router.get("/faculties", auth(["admin"]), getFaculties);
router.put("/faculty/:id", auth(["admin"]), updateFaculty);
router.delete("/faculty/:id", auth(["admin"]), deleteFaculty);

export default router;




