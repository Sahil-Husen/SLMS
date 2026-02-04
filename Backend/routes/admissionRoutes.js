import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
    createAdmissionApplication,
    getMyApplication,
    getAllApplications,
    getApplicationById,
    approveAdmission,
    rejectAdmission,
    getApplicationStats,
    updateApplicationStatus
} from "../controllers/AdmissionApplication.js";

const router = express.Router();

// Only students can create or view their own applications
router.post("/apply", auth(["student"]), createAdmissionApplication);
router.get("/me", auth(["student"]), getMyApplication);
router.get("/getAllApplication", auth(["admin"]), getAllApplications)
router.get("/getApplication/:id", auth(["admin", "faculty"]), getApplicationById);
router.put("/approve/:applicationId", auth(["admin"]), approveAdmission);
router.put("/reject/:applicationId", auth(["admin"]), rejectAdmission);
router.get("/getApplicationStats", getApplicationStats)
router.put("/updateStatus", auth(["admin"]), updateApplicationStatus)

export default router;
