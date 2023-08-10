import Leave from "../../models/Leave.js";
import sendEmail from "../../config/sendEmail.js"
import Department from "../../models/Department.js";
//const sendEmail = require('../../config/sendEmail.js');
import User from "../../models/User.js";
import ejs from "ejs";
import path from "path";
import escapeHTML from "escape-html";




var __dirname = path.resolve();

class LeaveController {
    static get = async (req, res) => {
        try {
            //const data = await Leave.find();

            const data = await Leave.find().sort({ _id: -1 }).populate("user_id");

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
            const data = await Leave.find({ user_id: req.params.id }).sort({ _id: -1 }).populate("user_id");
            if (data.length > 0) {
                res.status(200).send(data);
            } else {
                res.status(404).send("Data not found...!");
            }
        } catch (error) {
            res.status(404).send(error);
        }
    };
    static leaveUpdate = async (req, res) => {
        try {
            const leaves = req.body.leaves;
            const data = await User.updateOne({ _id: req.params.id }, { $set: { leaves: req.body.leaves } });
            return res.status(200).send(data);
        } catch (error) {
            return res.status(400).json(error);
        }
    }
    static update = async (req, res) => {
        const uid = escapeHTML(req.params.id);
        let renderedTemplate;
        const leave_data = await Leave.findById(uid).populate("user_id");
        //retrive data form sending mail
        const department = await Department.findById(leave_data.user_id.department).populate("dept_head");
        const department_hr = await Department.find({ name: 'Hr' }).populate("dept_head");

        let mailList = [leave_data.user_id.email, department.dept_head.email, department_hr[0].dept_head.email];
        mailList.toString();
        //retrive data form sending mail
        //return res.status(200).send(mailList);

        try {
            const post_data = {};
            if (req.body.role === 'Hr') {
                post_data.hr_approve = req.body.approve;
            } else if (req.body.role === 'Tl') {
                post_data.tl_approve = req.body.approve;
            } else if (req.body.role === 'Admin') {
                post_data.admin_approve = req.body.approve;
                post_data.tl_approve = req.body.approve;
                post_data.hr_approve = req.body.approve;
            } else {
                post_data = {};
            }

            // To calculate the no. of days between two dates
            //let toDate = new Date(leave_data.to_date).toISOString().substring(0, 10);
            //let fromDate1 = new Date(leave_data.from_date).toISOString().substring(0, 10);
            let toDate = new Date(leave_data.to_date);
            let fromDate = new Date(leave_data.from_date);

            let diff = Math.abs(fromDate - toDate)
            let daysDiff = diff / (1000 * 60 * 60 * 24);
            daysDiff = daysDiff + 1;

            if (req.body.approve === "Approve") {

                renderedTemplate = await ejs.renderFile(__dirname + "/app/views/emails/LeaveApproveEmail.ejs", {
                    to_date: new Date(leave_data.to_date).toISOString().substring(0, 10),
                    from_date: new Date(leave_data.from_date).toISOString().substring(0, 10),
                    first_name: leave_data.user_id.first_name
                });

                const data = await User.updateOne({ _id: leave_data.user_id._id }, { $inc: { leaves: -daysDiff } });
                sendEmail(mailList, 'Leave Approval - ' + req.body.role, renderedTemplate);
                //return res.status(200).send({ dd: leave_data.user_id._id });
            } else {
                renderedTemplate = await ejs.renderFile(__dirname + "/app/views/emails/LeaveRejectEmail.ejs", {
                    to_date: new Date(leave_data.to_date).toISOString().substring(0, 10),
                    from_date: new Date(leave_data.from_date).toISOString().substring(0, 10),
                    first_name: leave_data.user_id.first_name
                });
                sendEmail(mailList, 'Leave Reject - ' + req.body.role, renderedTemplate);
            }
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
            let renderedTemplate;
            const user = await User.findById(user_id);
            const department = await Department.findById(user.department).populate("dept_head");
            const department_hr = await Department.find({ name: 'Hr' }).populate("dept_head");

            let mailList = [user.email, department.dept_head.email, department_hr[0].dept_head.email];
            mailList.toString();

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
            renderedTemplate = await ejs.renderFile(__dirname + "/app/views/emails/LeaveApplyEmail.ejs", {
                to_date: new Date(to_date).toISOString().substring(0, 10),
                from_date: new Date(from_date).toISOString().substring(0, 10),
                first_name: user.first_name,
                reason: reason,
                leave_type: leave_type
            });

            sendEmail(mailList, 'Leave Request - ', renderedTemplate);

            //sendEmail('vivek.kumar@gmail.com', 'Hello', 'This is the email body.');
            // return new user
            return res.status(200).json(user);

        } catch (err) {
            return res.status(400).json(err);
        }
        // Our register logic ends here
    }



}
export default LeaveController;