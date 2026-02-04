import AdmissionApplication from "../models/AdmissionApplication.js";
import User from "../models/User.js";

// Create an admission application
export const createAdmissionApplication = async (req, res) => {
    try {
        const userId = req.user._id; // coming from auth middleware
        const { appliedProgram, preferredDepartment, course, marks } = req.body;

        // 1. Check if user exists (redundant but safe)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not registered" });
        }

        // 2. Check if user already submitted an application
        const existingApplication = await AdmissionApplication.findOne({ userId });
        if (existingApplication) {
            return res.status(400).json({
                message: "Admission application already submitted",
            });
        }

        // 3. Create new admission application
        const application = await AdmissionApplication.create({
            userId,
            appliedProgram,
            preferredDepartment,
            course,
            marks,
        });

        return res.status(201).json({
            message: "Admission application submitted successfully",
            application,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to submit admission application",
            error: error.message,
        });
    }
};

// Optional: Get logged-in student's application
export const getMyApplication = async (req, res) => {
    try {
        const userId = req.user._id;

        const application = await AdmissionApplication.findOne({ userId })
            .populate("preferredDepartment")
            .populate("course");

        if (!application) {
            return res.status(404).json({
                message: "No admission application found",
            });
        }

        return res.status(200).json(application);
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch application",
            error: error.message,
        });
    }
};
