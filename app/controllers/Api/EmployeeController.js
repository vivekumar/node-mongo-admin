import User from "../../models/User.js";
import Role from "../../models/Role.js";
import path from "path";
import bcrypt from "bcryptjs";
import multer from "multer";
class EmployeeController {
    static get = async (req, res) => {
        try {
            const data = await User.find();
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
        try {
            const data = await User.findById(req.params.id);
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
        let encryptedPassword;

        const type = req.body.type || 'Employee';
        const roleData = await Role.findOne({ name: type })
        const roles = [roleData._id]

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


}
export default EmployeeController;