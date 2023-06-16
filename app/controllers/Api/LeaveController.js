import Leave from "../../models/Leave.js";

class LeaveController {

    static create = async (req, res) => {

        try {
            // Get user input
            const { leave_type, from_date, to_date, reason } = req.body;

            // Validate user input
            if (!(leave_type && from_date && to_date && reason)) {
                return res.status(400).send("All input is required");
            }
            // Create user in our database
            const leave = await Leave.create({
                leave_type,
                from_date,
                to_date,
                reason
            });

            // return new user
            return res.status(200).json(leave);

        } catch (err) {
            return res.status(400).json(err);
        }
        // Our register logic ends here
    }


}
export default LeaveController;