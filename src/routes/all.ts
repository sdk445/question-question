import { Router } from "express";
import CategoryController from "../controllers/CategoryController";
import QuestionController from "../controllers/QuestionController";
import UserController from "../controllers/UserController";
// not using diffferent files for routes here .
import multer from "multer";
const upload = multer({ dest: "uploads/" });
const router = Router();

//user router
router.get("/signup",UserController.signup)
router.get("/login",UserController.login)

//question router
router.get("/categories", CategoryController.getCategoriesWithQuestionCount);
router.get("/category", QuestionController.getQuestionsByCategory);
router.get("/search", QuestionController.searchQuestionsWithAnswers);
router.post("/questions/upload", upload.single("file"),QuestionController.uploadQuestions);

export default router;
