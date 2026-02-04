import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";

// Faculty: Create attendance for a course/date
export const createAttendance = async (req, res) => {
    try {
        const { courseId, date, records } = req.body;

        if (!courseId || !date || !records || !records.length) {
            return res.status(400).json({ message: "Course, date and records are required" });
        }

        // Prevent duplicate attendance
        const existing = await Attendance.findOne({ courseId, date: new Date(date) });
        if (existing) return res.status(400).json({ message: "Attendance already exists for this course/date" });

        // Ensure studentIds are unique
        const studentIds = records.map(r => r.studentId.toString());
        if (new Set(studentIds).size !== studentIds.length) {
            return res.status(400).json({ message: "Duplicate studentIds in records" });
        }

        const attendance = await Attendance.create({
            courseId,
            date: new Date(date),
            records,
        });

        return res.status(201).json({ message: "Attendance created", attendance });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Faculty: Update individual student attendance
export const updateStudentAttendance = async (req, res) => {
    try {
        const { attendanceId, studentId } = req.params;
        const { status, remarks } = req.body;

        if (!["Present", "Absent"].includes(status)) return res.status(400).json({ message: "Invalid status" });

        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) return res.status(404).json({ message: "Attendance not found" });

        const record = attendance.records.find(r => r.studentId.toString() === studentId);
        if (!record) return res.status(404).json({ message: "Student not found in this attendance" });

        record.status = status;
        if (remarks) record.remarks = remarks;

        await attendance.save();

        return res.status(200).json({ message: "Attendance updated", attendance });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Student: View own attendance
export const getMyAttendance = async (req, res) => {
    try {
        // Find the Student document linked to the logged-in User
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) return res.status(404).json({ message: "Student profile not found" });

        const studentId = student._id;

        const attendances = await Attendance.find({ "records.studentId": studentId })
            .populate("courseId", "name")
            .select("courseId date records");

        if (!attendances.length) return res.status(404).json({ message: "No attendance records found" });

        const result = attendances.map(att => {
            const studentRecord = att.records.find(r => r.studentId.toString() === studentId.toString());
            return {
                course: att.courseId.name,
                date: att.date,
                status: studentRecord.status,
                remarks: studentRecord.remarks || "",
            };
        });

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
