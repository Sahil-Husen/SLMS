import AdmissionApplication from "../models/AdmissionApplication.js";

export const getAllAdmissions = async (req, res) => {
  const applications = await AdmissionApplication.find()
    .populate("userId", "name email")
    .populate("preferredDepartment");

  res.json(applications);
};
