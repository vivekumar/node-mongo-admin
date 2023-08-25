import Leave from "../../models/Leave.js";
import sendEmail from "../../config/sendEmail.js"
import Department from "../../models/Department.js";
//const sendEmail = require('../../config/sendEmail.js');
import User from "../../models/User.js";
import ejs from "ejs";
import path from "path";
import escapeHTML from "escape-html";
import Moment from "moment";



var __dirname = path.resolve();

class LeaveController {
    static get = async (req, res) => {
        const itemsPerPage = 5;
        try {
            const page = parseInt(req.query.page) || 1;
            const totalCount = await Leave.countDocuments();
            const totalPages = Math.ceil(totalCount / itemsPerPage);
            const data = await Leave.find()
                .skip((page - 1) * itemsPerPage)
                .limit(itemsPerPage)
                .sort({ _id: -1 }).populate("user_id");

            //const items = await Leave.find().skip((page - 1) * itemsPerPage).limit(itemsPerPage);


            if (data.length > 0) {
                res.status(200).send({ data, totalPages, currentPage: page });
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
        let renderedTemplate; let daysDiff; let toDate; let fromDate;
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
            if (leave_data.leave_type === 'Sort Leave') {
                daysDiff = 0.5;
                toDate = Moment(leave_data.to_date).format('LLL');
                fromDate = Moment(leave_data.from_date).format('LLL');
            } else if (leave_data.leave_type === 'Half Day Leave') {
                daysDiff = 0.25;
                toDate = Moment(leave_data.to_date).format('LLL');
                fromDate = Moment(leave_data.from_date).format('LLL');
            } else {
                toDate = new Date(leave_data.to_date);
                fromDate = new Date(leave_data.from_date);

                let diff = Math.abs(fromDate - toDate)
                let daysDiff1 = diff / (1000 * 60 * 60 * 24);
                daysDiff = daysDiff1 + 1;

                toDate = Moment(leave_data.to_date).format('LL');
                fromDate = Moment(leave_data.from_date).format('LL');
            }


            if (req.body.approve === "Approve") {
                renderedTemplate = await ejs.renderFile(__dirname + "/app/views/emails/LeaveApproveEmail.ejs", {
                    to_date: toDate,
                    from_date: fromDate,
                    first_name: leave_data.user_id.first_name
                });
                sendEmail(mailList, 'Leave Approval - ' + req.body.role, renderedTemplate);
                //return res.status(200).send({ dd: leave_data.user_id._id });
            } else {
                renderedTemplate = await ejs.renderFile(__dirname + "/app/views/emails/LeaveRejectEmail.ejs", {
                    to_date: toDate,
                    from_date: fromDate,
                    first_name: leave_data.user_id.first_name
                });
                sendEmail(mailList, 'Leave Reject - ' + req.body.role, renderedTemplate);
            }

            const data = await Leave.findByIdAndUpdate(req.params.id, post_data);
            if (data) {
                const leave_data2 = await Leave.findById(uid).populate("user_id");
                if (leave_data2.tl_approve === 'Approve' && leave_data2.hr_approve === 'Approve') {
                    await User.updateOne({ _id: leave_data.user_id._id }, { $inc: { leaves: -daysDiff } });
                }

            }

            return res.status(200).send(data);

        } catch (error) {
            return res.status(404).send(error);
        }
    };
    static create = async (req, res) => {
        let data = {};
        let toDate; let fromDate;
        try {
            // Get user input
            //const { leave_type, from_date, to_date, reason, user_id } = req.body;
            let renderedTemplate;
            const user = await User.findById(req.body.user_id);
            const department = await Department.findById(user.department).populate("dept_head");
            const department_hr = await Department.find({ name: 'Hr' }).populate("dept_head");

            let mailList = [user.email, department.dept_head.email, department_hr[0].dept_head.email];
            mailList.toString();

            // Validate user input
            if (!(req.body.leave_type && req.body.reason && req.body.user_id)) {
                return res.status(400).send("All input is required");
            }

            // Create user in our database
            const reason = req.body.reason;
            const leave_type = req.body.leave_type;
            data.leave_type = req.body.leave_type;
            data.user_id = req.body.user_id;
            data.reason = reason;

            if (leave_type === 'Sort Leave') {
                const fromDatetime = new Date(req.body.from_date);
                const toDatetime = new Date(req.body.to_date);
                let timeDiff = (fromDatetime - toDatetime) / 60000;
                timeDiff = Math.abs(timeDiff);
                if (timeDiff > 120) {
                    return res.status(400).json({ timeDiff });
                }
                data.from_date = req.body.from_date;
                data.to_date = req.body.to_date;
            } else {
                data.from_date = req.body.from_date;
                data.to_date = req.body.to_date;
            }

            if (leave_data.leave_type === 'Sort Leave' || leave_data.leave_type === 'Half Day Leave') {
                toDate = Moment(leave_data.to_date).format('LLL');
                fromDate = Moment(leave_data.from_date).format('LLL');
            } else {
                toDate = Moment(leave_data.to_date).format('LL');
                fromDate = Moment(leave_data.from_date).format('LL');
            }
            const leave = await Leave.create(data);
            renderedTemplate = await ejs.renderFile(__dirname + "/app/views/emails/LeaveApplyEmail.ejs", {
                to_date: toDate,
                from_date: fromDate,
                first_name: user.first_name,
                reason: reason,
                leave_type: leave_type

            });

            sendEmail(mailList, 'Leave Request - ', renderedTemplate);

            //sendEmail('vivek.kumar@gmail.com', 'Hello', 'This is the email body.');
            // return new user
            return res.status(200).json(leave);

        } catch (err) {
            return res.status(400).json(err);
        }
        // Our register logic ends here
    }



}
export default LeaveController;