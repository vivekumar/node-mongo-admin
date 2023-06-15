import User from "../../models/User.js";
import path from "path";
import bcrypt from "bcryptjs";

class EmployeeController {

    static create = async (req, res) => {
        let encryptedPassword;
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
                profile_img } = req.body;
            // Validate user input
            if (!(email && password && first_name && last_name)) {
                res.status(400).send("All input is required");
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
                company,
                emp_id,
                join_data,
                phone,
                department,
                designation,
                description,
                profile_img
            });

            // return new user
            res.status(200).json(user);

        } catch (err) {
            res.status(400).json(err);
        }
        // Our register logic ends here
    }


}
export default EmployeeController;