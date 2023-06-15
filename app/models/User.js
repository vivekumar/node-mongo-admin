import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    token: { type: String },
    company: { type: String },
    emp_id: { type: String },
    join_data: { type: String },
    phone: { type: String },
    department: { type: String },
    designation: { type: String },
    description: { type: String },
    profile_img: { type: String },
});

const user = mongoose.model("users", userSchema);
export default user;