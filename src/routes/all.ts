import { Router } from "express";
import CategoryController from "../controllers/CategoryController";
import QuestionController from "../controllers/QuestionController";
import UserController from "../controllers/UserController";
// not using diffferent files for routes here .
import multer from "multer";
import {authenticate} from '../utils/auth'
const upload = multer({ dest: "uploads/" });
const router = Router();


//doing all the routes in one place 

//user router
router.get("/signup", UserController.signup)
router.get("/login", UserController.login)
router.post("/update-user", UserController.editProfile)

//question router
router.get("/categories", CategoryController.getCategoriesWithQuestionCount);
router.get("/category", QuestionController.getQuestionsByCategory);
router.get("/search", QuestionController.searchQuestionsWithAnswers);
router.post("/questions/upload", upload.single("file"), QuestionController.uploadQuestions);


// auth routes demo
router.get("/some-route", authenticate,UserController.signup)

export default router;
