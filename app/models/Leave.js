import mongoose from "mongoose";

// SCHMA
const LeaveSchema = new mongoose.Schema(
    {
        leave_type: { type: String, required: true },
        from_date: { type: Date, required: true },
        to_date: { type: Date, required: true },
        reason: { type: String, required: true },
        hr_approve: { type: String, required: false },
        tl_approve: { type: String, required: false },
        admin_approve: { type: String, required: false },
        user_id: { type: String, required: true, ref: 'users' },
        createdAt: { type: Date, default: Date.now },
    }
);

// MODEL
const leave = mongoose.model("leaves", LeaveSchema);

export default leave;