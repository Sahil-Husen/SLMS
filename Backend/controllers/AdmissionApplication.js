import AdmissionApplication from "../models/AdmissionApplication.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Student from "../models/Student.js";

// Create an admission application
export const createAdmissionApplication = async (req, res) => {
    try {
        console.log("Started creating admission application...");
        const userId = req.user._id;
        const { appliedProgram, course, marks } = req.body;
        

        // 1. Validate required fields
        if (!appliedProgram || !course || !marks) {
            return res.status(400).json({
                message: "Applied program, course, and marks are required"
            });
        }

        // 2. Validate course exists and get its department
        const courseData = await Course.findById(course).populate('departmentId');
        if (!courseData) {
            return res.status(404).json({ message: "Course not found" });
        }

        // 3. Check if course is active
        if (courseData.isActive === false) {
            return res.status(400).json({
                message: "This course is currently not accepting admissions"
            });
        }

        // 4. Check if course has available seats
        if (courseData.availableSeats <= 0) {
            return res.status(400).json({
                message: "No available seats in this course",
                courseCode: courseData.courseCode,
                courseName: courseData.courseName
            });
        }

        // 5. Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not registered" });
        }

        // 6. Check if user already submitted an application
        const existingApplication = await AdmissionApplication.findOne({ userId });
        if (existingApplication) {
            return res.status(400).json({
                message: "Admission application already submitted",
                existingApplication: {
                    id: existingApplication._id,
                    status: existingApplication.status,
                    appliedProgram: existingApplication.appliedProgram
                }
            });
        }

        // 7. Auto-assign department from the course
        const preferredDepartment = courseData.departmentId._id;

        // 8. Create new admission application
        const application = await AdmissionApplication.create({
            userId,
            appliedProgram,
            preferredDepartment,
            course,
            marks,
            status: 'submitted'
        });

        // 9. Populate for response
        const populatedApplication = await AdmissionApplication.findById(application._id)
            .populate('preferredDepartment', 'name code')
            .populate('course', 'courseCode courseName maxSeats availableSeats credits')
            .populate('userId', 'name email role');

        return res.status(201).json({
            message: "Admission application submitted successfully",
            application: populatedApplication,
        });
    } catch (error) {
        console.error("Error creating admission application:", error);
        return res.status(500).json({
            message: "Failed to submit admission application",
            error: error.message,
        });
    }
};

// Get logged-in student's application
export const getMyApplication = async (req, res) => {
    try {
        const userId = req.user._id;

        const application = await AdmissionApplication.findOne({ userId })
            .populate('preferredDepartment', 'name code')
            .populate('course', 'courseCode courseName maxSeats availableSeats credits')
            .populate('userId', 'name email');

        if (!application) {
            return res.status(404).json({
                message: "No admission application found",
            });
        }

        return res.status(200).json({
            message: "Application retrieved successfully",
            application
        });
    } catch (error) {
        console.error("Error fetching application:", error);
        return res.status(500).json({
            message: "Failed to fetch application",
            error: error.message,
        });
    }
};

// Admin/Faculty: Get all applications
export const getAllApplications = async (req, res) => {
    try {
        const { status, program, department, course } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (program) filter.appliedProgram = program;
        if (department) filter.preferredDepartment = department;
        if (course) filter.course = course;

        const applications = await AdmissionApplication.find(filter)
            .populate('userId', 'name email')
            .populate('preferredDepartment', 'name code')
            .populate('course', 'courseCode courseName maxSeats availableSeats')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Applications retrieved successfully",
            count: applications.length,
            applications
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
        return res.status(500).json({
            message: "Failed to fetch applications",
            error: error.message,
        });
    }
};

// Admin/Faculty: Get single application by ID
export const getApplicationById = async (req, res) => {
    try {
        console.log(req.params);
        const { _id } = req.params;

        const application = await AdmissionApplication.findById(_id)
            .populate('userId', 'name email role')
            .populate('preferredDepartment', 'name code')
            .populate('course', 'courseCode courseName maxSeats availableSeats credits');

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        return res.status(200).json({
            message: "Application retrieved successfully",
            application
        });
    } catch (error) {
        console.error("Error fetching application:", error);
        return res.status(500).json({
            message: "Failed to fetch application",
            error: error.message,
        });
    }
};

// Admin: Approve admission application
export const approveAdmission = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { studentId, enrollmentStatus } = req.body;

        const application = await AdmissionApplication.findById(applicationId)
            .populate('course')
            .populate('userId');

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (application.status !== 'submitted') {
            return res.status(400).json({
                message: `Cannot approve application with status: ${application.status}`
            });
        }

        // Check if course still has available seats
        const course = await Course.findById(application.course._id);
        if (course.availableSeats <= 0) {
            return res.status(400).json({
                message: "No available seats in this course"
            });
        }

        // Update application status
        application.status = 'approved';
        application.approvedAt = new Date();
        application.approvedBy = req.user._id;
        await application.save();

        // Decrease available seats
        course.availableSeats -= 1;
        await course.save();

        // Create Student profile (if not exists)
        let student = await Student.findOne({ userId: application.userId._id });

        if (!student) {
            student = await Student.create({
                userId: application.userId._id,
                studentId: studentId || `STU${Date.now()}`,
                departmentId: application.preferredDepartment,
                enrollmentStatus: enrollmentStatus || 'active'
            });
        }

        const populatedApplication = await AdmissionApplication.findById(applicationId)
            .populate('userId', 'name email')
            .populate('preferredDepartment', 'name code')
            .populate('course', 'courseCode courseName');

        return res.status(200).json({
            message: "Application approved successfully",
            application: populatedApplication,
            student
        });
    } catch (error) {
        console.error("Error approving application:", error);
        return res.status(500).json({
            message: "Failed to approve application",
            error: error.message,
        });
    }
};

// Admin: Reject admission application
export const rejectAdmission = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ message: "Rejection reason is required" });
        }

        const application = await AdmissionApplication.findById(applicationId);

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (application.status !== 'submitted') {
            return res.status(400).json({
                message: `Cannot reject application with status: ${application.status}`
            });
        }

        application.status = 'rejected';
        application.rejectionReason = reason;
        application.rejectedAt = new Date();
        application.rejectedBy = req.user._id;
        await application.save();

        const populatedApplication = await AdmissionApplication.findById(applicationId)
            .populate('userId', 'name email')
            .populate('preferredDepartment', 'name code')
            .populate('course', 'courseCode courseName');

        return res.status(200).json({
            message: "Application rejected",
            application: populatedApplication,
        });
    } catch (error) {
        console.error("Error rejecting application:", error);
        return res.status(500).json({
            message: "Failed to reject application",
            error: error.message,
        });
    }
};

// Admin: Update application status
export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, remarks } = req.body;

        const validStatuses = ['submitted', 'under_review', 'approved', 'rejected', 'withdrawn'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
                validStatuses
            });
        }

        const application = await AdmissionApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        application.status = status;
        if (remarks) application.remarks = remarks;
        await application.save();

        const populatedApplication = await AdmissionApplication.findById(applicationId)
            .populate('userId', 'name email')
            .populate('preferredDepartment', 'name code')
            .populate('course', 'courseCode courseName');

        return res.status(200).json({
            message: "Application status updated",
            application: populatedApplication,
        });
    } catch (error) {
        console.error("Error updating application status:", error);
        return res.status(500).json({
            message: "Failed to update application status",
            error: error.message,
        });
    }
};

// Student: Withdraw application
export const withdrawApplication = async (req, res) => {
    try {
        const userId = req.user._id;

        const application = await AdmissionApplication.findOne({ userId });

        if (!application) {
            return res.status(404).json({ message: "No application found" });
        }

        if (application.status === 'approved') {
            return res.status(400).json({
                message: "Cannot withdraw an approved application. Please contact admin."
            });
        }

        if (application.status === 'withdrawn') {
            return res.status(400).json({
                message: "Application is already withdrawn"
            });
        }

        application.status = 'withdrawn';
        application.withdrawnAt = new Date();
        await application.save();

        return res.status(200).json({
            message: "Application withdrawn successfully",
            application
        });
    } catch (error) {
        console.error("Error withdrawing application:", error);
        return res.status(500).json({
            message: "Failed to withdraw application",
            error: error.message,
        });
    }
};

// Admin: Get application statistics
export const getApplicationStats = async (req, res) => {
    try {
        const stats = await AdmissionApplication.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const programStats = await AdmissionApplication.aggregate([
            {
                $group: {
                    _id: '$appliedProgram',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalApplications = await AdmissionApplication.countDocuments();

        return res.status(200).json({
            message: "Statistics retrieved successfully",
            totalApplications,
            statusWise: stats,
            programWise: programStats
        });
    } catch (error) {
        console.error("Error fetching statistics:", error);
        return res.status(500).json({
            message: "Failed to fetch statistics",
            error: error.message,
        });
    }
};

export default {
    createAdmissionApplication,
    getMyApplication,
    getAllApplications,
    getApplicationById,
    approveAdmission,
    rejectAdmission,
    updateApplicationStatus,
    withdrawApplication,
    getApplicationStats
};