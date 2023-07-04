import Attendance from "../../models/Attendance.js";
//import fs from "fs"

class AttendanceController {
    // READ ALL DATA   
    static get = async (req, res) => {
        try {
            const data = await Attendance.find();

            if (data.length > 0) {
                res.status(200).send({
                    status: "success",
                    message: "All Data Show!!!",
                    data: data,
                });
            } else {
                res.status(404).send({
                    status: "failed",
                    message: "Data not found...!",
                });
            }
        } catch (error) {
            console.log("Get All Data - ", error);
        }
    };
    static getOneByUserId = async (req, res) => {
        try {
            var todayDate = new Date().toISOString().slice(0, 10);
            const data = await Attendance.find({
                user_id: req.params.id,
                in_time: { $gte: todayDate },
                //in_time: { $lt: todayDate }
            });
            if (data.length == 1) {
                return res.status(200).send(data[0]);
            } else {
                return res.status(404).send("Data not found...!");
            }
        } catch (error) {
            return res.status(404).send(error);
        }
    };
    static getByUserId = async (req, res) => {
        try {
            const data = await Attendance.find(
                { user_id: req.params.id },

            ).sort({ "_id": -1 }).limit(20);
            if (data.length > 0) {
                return res.status(200).send(data);
            } else {
                return res.status(404).send("Data not found...!");
            }
        } catch (error) {
            return res.status(404).send(error);
        }
    };
    // CREAT
    static create = async (req, res) => {
        let data = {};
        try {
            if (req.body.status === "InTime") {
                data.user_id = req.body.userId;
                data.out_time = '';
                data.ip = req.connection.remoteAddress;
                const result = await Attendance.create(data);
                res.status(200).send({
                    status: "success",
                    message: "Attendance insert successful!!!",
                    result: result,
                });
            } else {

                data.out_time = new Date();
                const result = await Attendance.findByIdAndUpdate(req.body.punchId, data);
                res.status(200).send({
                    status: "success",
                    message: "Attendance insert successful!!!",
                    result: result,
                });
            }


        } catch (error) {
            console.log("Create Data - ", error);
        }
    };


    // DELETE
    static delete = async (req, res) => {
        try {
            const data = await Attendance.findByIdAndDelete(req.params.id, req.body);
            if (data) {
                res.status(200).send({
                    status: "success",
                    message: "Delete data Successful!!!",
                    data: data,
                });
            } else {
                res.status(404).send({
                    status: "failed",
                    message: "Data not Delete...!",
                });
            }
        } catch (error) {
            console.log("Delete Data - ", error);
        }
    };
}

export default AttendanceController;