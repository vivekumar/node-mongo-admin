import mongoose from "mongoose";

// SCHMA
const LeaveSchema = new mongoose.Schema(
    {
        leave_type: { type: String, required: true },
        from_date: { type: String, required: true },
        to_date: { type: String, required: true },
        reason: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    }
);

// MODEL
const leave = mongoose.model("leaves", LeaveSchema);

export default leave;