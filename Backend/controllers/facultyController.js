import Faculty from "../models/Faculty.js";

export const createFaculty = async (req, res) => {
   
  
  const faculty = await Faculty.create({ name: req.body.name });
  res.status(201).json(faculty);
};

export const getFaculties = async (req, res) => {
  const faculties = await Faculty.find();
  res.json(faculties);
};

export const updateFaculty = async (req, res) => {
  const faculty = await Faculty.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true },
  );
  res.json(faculty);
};

export const deleteFaculty = async (req, res) => {
  await Faculty.findByIdAndDelete(req.params.id);
  res.json({ message: "Faculty deleted" });
};
