import mongoose from "mongoose";

// SCHMA
const DepartmentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    }
);

// MODEL
const department = mongoose.model("departments", DepartmentSchema);

export default department;