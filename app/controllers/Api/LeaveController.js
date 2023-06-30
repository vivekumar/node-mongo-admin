import Leave from "../../models/Leave.js";
import sendEmail from "../../config/sendEmail.js"
//const sendEmail = require('../../config/sendEmail.js');
class LeaveController {
    static get = async (req, res) => {
        try {
            //const data = await Leave.find();

            const data = await Leave.find().populate("user_id");

            /*const data = Leave.find({})
                .populate('user_id')
                .exec(function (err, leaves, count) {
                    res.render('index', {
                        user: req.user,
                        leaves: leaves
                    });
                });*/

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
            const data = await Leave.find({ user_id: req.params.id }).populate("user_id");
            if (data.length > 0) {
                res.status(200).send(data);
            } else {
                res.status(404).send("Data not found...!");
            }
        } catch (error) {
            res.status(404).send(error);
        }
    };
    static update = async (req, res) => {
        try {
            const post_data = {};
            if (req.body.role === 'Hr') {
                post_data.hr_approve = req.body.approve;
            } else if (req.body.role === 'Tl') {
                post_data.tl_approve = req.body.approve;
            } else if (req.body.role === 'Admin') {
                post_data.admin_approve = req.body.approve;
            } else {
                post_data = {};
            }
            sendEmail('vivek.kumar@gmail.com', 'Hello', 'This is the email body.');
            const data = await Leave.findByIdAndUpdate(req.params.id, post_data);
            return res.status(200).send(data);

        } catch (error) {
            return res.status(404).send(error);
        }
    };
    static create = async (req, res) => {

        try {
            // Get user input
            const { leave_type, from_date, to_date, reason, user_id } = req.body;

            // Validate user input
            if (!(leave_type && from_date && to_date && reason && user_id)) {
                return res.status(400).send("All input is required");
            }
            // Create user in our database
            const leave = await Leave.create({
                leave_type,
                from_date,
                to_date,
                user_id,
                reason
            });
            sendEmail('vivek.kumar@gmail.com', 'Hello', 'This is the email body.');
            // return new user
            return res.status(200).json(leave);

        } catch (err) {
            return res.status(400).json(err);
        }
        // Our register logic ends here
    }


}
export default LeaveController;