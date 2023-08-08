import User from "../../models/User.js";
import Role from "../../models/Role.js";
import Attendance from "../../models/Attendance.js";
import path from "path";
import escapeHTML from "escape-html";
import bcrypt from "bcryptjs";
import multer from "multer";
class EmployeeController {
    static get = async (req, res) => {

        try {
            //return res.status(200).send(req.params.month);
            //const data = await User.find();
            // _id: 1,
            // in_time: 1,
            // out_time: 1,
            //     ip: 1,

            const currentMonth = Number(req.params.month) + 1;
            //const currentMonth = new Date().getMonth() + 1;            
            const currentYear = new Date().getFullYear();
            const data = await User.aggregate([
                {
                    $lookup: {
                        from: 'attendances',
                        localField: '_id',
                        foreignField: 'user_id',
                        as: 'attendanceInfo',
                    },
                },
                {
                    $project: {
                        first_name: 1,
                        last_name: 1,
                        email: 1,
                        phone: 1,
                        emp_id: 1,
                        designation: 1,
                        department: 1,
                        profile_img: 1,
                        attendanceInfo: {
                            $filter: {
                                input: '$attendanceInfo',
                                as: 'attendance',
                                cond: {
                                    $and: [
                                        { $eq: [{ $year: '$$attendance.in_time' }, currentYear] },
                                        { $eq: [{ $month: '$$attendance.in_time' }, currentMonth] },
                                    ],
                                },
                            },
                        },
                    },
                },
            ]);
            if (data.length > 0) {
                res.status(200).send(data);
            } else {
                res.status(404).send("Data not found...!");
            }
        } catch (error) {
            res.status(404).send(error);
        }
    };
    static getById = async (req, res) => {
        const uid = escapeHTML(req.params.id);
        try {
            const data = await User.findById(uid).populate("designation").populate("department");
            //const data = await User.find((user) => user.id == uid);
            if (data) {
                return res.status(200).send(data);
            } else {
                return res.status(404).send("Data not found...!");
            }
        } catch (error) {
            return res.status(404).send(error);
        }
    };
    static create = async (req, res) => {
        let encryptedPassword; let roles;
        let login_user_role = await Role.findById(req.user.roles)
        if (login_user_role === 'Admin') {
            roles = [req.body.role]
        } else {
            const type = 'Employee';
            const roleData = await Role.findOne({ name: type })
            roles = [roleData._id]
        }


        // Our register logic starts here
        try {
            // Get user input
            const { first_name, last_name, email, password, company,
                emp_id,
                join_data,
                phone,
                department,
                designation,
                description,
            } = req.body;

            //const { filename, path } = req.file;
            const path = req.file.path.split('/').slice(1).join('/');
            // Save the image metadata and additional fields to the database            

            // Validate user input
            if (!(email && password && first_name && last_name)) {
                return res.status(400).send("All input is required");
            }
            // check if user already exist
            // Validate if user exist in our database
            const oldUser = await User.findOne({ email });

            if (oldUser) {
                return res.status(409).send("User Already Exist. Please Login");
            }

            //Encrypt user password
            encryptedPassword = await bcrypt.hash(password, 10);

            // Create user in our database
            const user = await User.create({
                first_name,
                last_name,
                email: email.toLowerCase(), // sanitize: convert email to lowercase
                password: encryptedPassword,
                profile_img: path,
                company,
                emp_id,
                join_data,
                phone,
                department,
                designation,
                description,
                roles
            });

            // return new user
            return res.status(200).send(user);

        } catch (err) {
            return res.status(400).send(err);
        }
        // Our register logic ends here
    }

    static remove = async (req, res) => {
        try {

            const data = await User.deleteOne({ _id: req.params.id });

            if (data) {
                return res.status(200).send('success');
            } else {
                return res.status(404).send('failed');
            }
        } catch (error) {
            return res.status(404).send(error);
        }
    }
}
export default EmployeeController;