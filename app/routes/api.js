import express from "express";
import ApiAuth from "../middleware/Auth.js"
import coursesController from "../controllers/Api/CoursesController.js";
import AuthController from "../controllers/Api/AuthController.js";
import DepartmentController from "../controllers/Api/DepartmentController.js";
import DesignationController from "../controllers/Api/DesignationController.js";
import EmployeeController from "../controllers/Api/EmployeeController.js";
import multer from "multer";
import upload from "../middleware/multerMiddleware.js"
import LeaveController from "../controllers/Api/LeaveController.js";
import HolidayController from "../controllers/Api/HolidayController.js";


const router = express.Router();

router.post("/login", AuthController.authCheck);
router.post("/register", AuthController.postRegister);
router.post("/logout", AuthController.logout);
// router.get("/", ApiAuth, coursesController.index);
// router.post("/course/create", ApiAuth, coursesController.create);
router.get("/course", ApiAuth, coursesController.get);
// router.get("/course/:id", ApiAuth, coursesController.view);
// router.put("/course/:id", ApiAuth, coursesController.update);
// router.delete("/course/:id", ApiAuth, coursesController.delete);


router.get("/departments", ApiAuth, DepartmentController.get);

router.get("/designations", ApiAuth, DesignationController.get);


router.post("/save-leave", ApiAuth, LeaveController.create);
router.get("/leaves", ApiAuth, LeaveController.get);
router.get("/leave/:id", ApiAuth, LeaveController.getById);


router.get("/employees", ApiAuth, EmployeeController.get);
router.get("/employees/:id", ApiAuth, EmployeeController.getById);
router.post("/create-employee", upload.single('profile_img'), EmployeeController.create);


router.post("/save-holiday", ApiAuth, HolidayController.create);
router.get("/holidays", ApiAuth, HolidayController.get);
router.get("/remove-holidays/:id", ApiAuth, HolidayController.remove);

export default router;