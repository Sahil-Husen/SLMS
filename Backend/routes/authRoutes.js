import express from "express";
import { signupStudent,login } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signupStudent);
router.post("/login",login);

export default router;
