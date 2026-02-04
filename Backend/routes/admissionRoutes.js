import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
    createAdmissionApplication,
    getMyApplication,
} from "../controllers/AdmissionApplication.js";

const router = express.Router();

// Only students can create or view their own applications
router.post("/apply", auth(["student"]), createAdmissionApplication);
router.get("/me", auth(["student"]), getMyApplication);

export default router;
