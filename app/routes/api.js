import express from "express";
import ApiAuth from "../middleware/Auth.js"
import coursesController from "../controllers/Api/CoursesController.js";
import AuthController from "../controllers/Api/AuthController.js";
import DepartmentController from "../controllers/Api/DepartmentController.js";
import DesignationController from "../controllers/Api/DesignationController.js";
const router = express.Router();

router.post("/login", AuthController.authCheck);
router.post("/register", AuthController.postRegister);

// router.get("/", ApiAuth, coursesController.index);
// router.post("/course/create", ApiAuth, coursesController.create);
router.get("/course", ApiAuth, coursesController.get);
// router.get("/course/:id", ApiAuth, coursesController.view);
// router.put("/course/:id", ApiAuth, coursesController.update);
// router.delete("/course/:id", ApiAuth, coursesController.delete);


router.get("/departments", ApiAuth, DepartmentController.get);

router.get("/designations", ApiAuth, DesignationController.get);

export default router;