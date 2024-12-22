import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer extends Document {
  user: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  answer: string;
  submittedAt: Date;
  timezone: string;
}

const AnswerSchema = new Schema<IAnswer>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  answer: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  timezone: { type: String, required: true },
});

export default mongoose.model<IAnswer>("Answer", AnswerSchema);
