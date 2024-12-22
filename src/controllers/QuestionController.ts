import { Request, Response } from "express";
import Question from "../models/QuestionModel";
import Category from "../models/CategoryModel";
import csvParser from "csv-parser";
import fs from "fs";
import bcrypt from 'bcrypt'
import { Types } from "mongoose";
class QuestionController {

    async getQuestionsByCategory(req: Request, res: Response) {
        const { categoryId } = req.query;
        const objectIdCategory = new Types.ObjectId(categoryId);
        try {
            const questions = await Question.aggregate([
                {
                    $match: {
                        categories: { $in: [objectIdCategory] },
                    },
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "categories",
                        foreignField: "_id",
                        as: "categoryDetails",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        text: 1,
                        options: 1,
                        categories: 1,
                        categoryDetails: { name: 1 },
                    },
                },
            ]);

            res.status(200).json(questions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async searchQuestionsWithAnswers(req: Request, res: Response) {
        const { userId, query } = req.query;
        // object id should be passed
        try {
            const results = await Question.aggregate([
                {
                    $match: {
                        text: { $regex: query, $options: "i" },
                    },
                },
                {
                    $lookup: {
                        from: "answers",
                        localField: "_id",
                        foreignField: "question",
                        as: "userAnswers",
                    },
                },
                {
                    $unwind: "$userAnswers",
                },
                {
                    $match: {
                        "userAnswers.user": userId,
                    },
                },
                {
                    $project: {
                        _id: 1,
                        text: 1,
                        options: 1,
                        "userAnswers.answer": 1,
                        "userAnswers.submittedAt": 1,
                        "userAnswers.timezone": 1,
                    },
                },
                {
                    $addFields: {
                        submittedAtLocal: {
                            $dateToString: {
                                format: "%Y-%m-%d %H:%M:%S",
                                date: "$userAnswers.submittedAt",
                                timezone: "$userAnswers.timezone",
                            },
                        },
                    },
                },
            ]);

            res.status(200).json(results);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    //7) Add question in bulk against different category (using a CSV file import).
    async uploadQuestions(req: Request, res: Response) {
        const filePath = req.file?.path;

        if (!filePath) {
            res.status(400).json({ error: "File missing" });
            return;
        }

        try {
            const questions: any[] = [];

            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => {
                    questions.push(row);
                })
                .on('end', async () => {
                    for (const question of questions) {
                        const categoryNames = question.categories.split(',');

                        // Check and create missing categories
                        const categoryIds: any[] = [];
                        for (const name of categoryNames) {
                            let category = await Category.findOne({ name: name.trim() });

                            if (!category) {
                                // Category does not exist, create it
                                category = new Category({ name: name.trim() });
                                await category.save();
                                console.log(`New category created: ${name}`);
                            }

                            categoryIds.push(category._id);
                        }

                        // Check if the question already exists in the database
                        const existingQuestion = await Question.findOne({ text: question.text });
                        if (existingQuestion) {
                            console.log(`Duplicate question found: ${question.text}`);
                            continue;  // Skip if the question already exists
                        }

                        const newQuestion = new Question({
                            text: question.text,
                            options: question.options.split(','),
                            correctOption: question.correctOption,
                            categories: categoryIds,
                        });

                        await newQuestion.save();
                    }

                    res.status(200).json({ message: "Questions uploaded successfully." });
                });
        } catch (error) {
            console.error("Error uploading questions:", error);
            res.status(500).json({ error: error.message });
        }
    }

    //not needed if we dont project data 
    // Helper function to compare the answer with the stored hashed value to make it more concise
    private async compareAnswer(questionId: string, providedAnswer: string): Promise<boolean> {
        try {
            const question = await Question.findById(questionId);
            if (!question) throw new Error("Question not found");

            // Compare the provided answer with the hashed answer in the database
            const isMatch = await bcrypt.compare(providedAnswer, question.correctOption);
            return isMatch;
        } catch (error) {
            throw new Error("Error comparing answer: " + error.message);
        }
    }
    

}

export default new QuestionController();
