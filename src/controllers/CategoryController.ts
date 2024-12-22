import { Request, Response } from "express";
import Category from "../models/CategoryModel";
import Question from "../models/QuestionModel";

/**
 * @author Chinmoy Das 
 * controller to managea category business logic , 
 * @returns CategoriesWithQuestionCount , and more 
 * ## not gonna repeat this through the app this is for demonstration only and i think its enough to serve the purpose
 */
class CategoryController {
  async getCategoriesWithQuestionCount(req: Request, res: Response) {
    try {
      const categories = await Category.aggregate([
        {
          $lookup: {
            from: "questions", 
            localField: "_id", 
            foreignField: "categories",
            as: "questions",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            totalQuestions: { $size: "$questions" },
          },
        },
      ]);

      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new CategoryController();
