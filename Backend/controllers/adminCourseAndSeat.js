import Course from "../models/Course.js";




 

export const createCourse = async (req, res) => {
  try {
    const {
      courseCode,
      courseName,
      departmentId,
      maxSeats
    } = req.body;

    const course = await Course.create({
      courseCode,
      courseName,
      departmentId,
      maxSeats,
      availableSeats: maxSeats
    });

    return res.status(201).json(course);
  } catch (error) {
    return res.status(400).json({
      message: "Course creation failed",
      error: error.message
    });
  }
};



//View Courses + Seats
export const getCourses = async (req, res) => {
  const courses = await Course.find().populate("department", "name");
  res.json(courses);
};


//Update Seats (if admin revises intake)
export const updateCourseSeats = async (req, res) => {
  const { totalSeats } = req.body;

  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  course.totalSeats = totalSeats;
  course.availableSeats = totalSeats; // reset logic (safe)
  await course.save();

  res.json(course);
};


export const getCoursesByDepartment = async (req, res) => {
  const courses = await Course.find({
    departmentId: req.params.departmentId
  });
  res.json(courses);
};