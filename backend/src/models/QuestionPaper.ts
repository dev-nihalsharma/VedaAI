import { Schema, model, Types } from 'mongoose';

const QuestionSchema = new Schema(
  {
    id: String,
    text: String,
    difficulty: { type: String, enum: ['easy', 'moderate', 'hard'] },
    marks: Number,
  },
  { _id: false }
);

const SectionSchema = new Schema(
  {
    id: String,
    title: String,
    instruction: String,
    questions: [QuestionSchema],
  },
  { _id: false }
);

const AnswerKeySchema = new Schema(
  {
    questionId: String,
    answer: String,
  },
  { _id: false }
);

const PaperMetaSchema = new Schema(
  {
    schoolName: String,
    subject: String,
    className: String,
    timeAllowed: String,
    maxMarks: Number,
    generalInstructions: String,
  },
  { _id: false }
);

const QuestionPaperSchema = new Schema(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    meta: PaperMetaSchema,
    sections: [SectionSchema],
    answerKey: [AnswerKeySchema],
    totals: {
      questions: Number,
      marks: Number,
    },
  },
  { timestamps: true }
);

export type QuestionPaperDoc = {
  _id: Types.ObjectId;
  assignmentId: Types.ObjectId;
  meta: {
    schoolName: string;
    subject: string;
    className: string;
    timeAllowed: string;
    maxMarks: number;
    generalInstructions: string;
  };
  sections: {
    id: string;
    title: string;
    instruction: string;
    questions: { id: string; text: string; difficulty: 'easy' | 'moderate' | 'hard'; marks: number }[];
  }[];
  answerKey?: { questionId: string; answer: string }[];
  totals: { questions: number; marks: number };
  createdAt: Date;
};

export const QuestionPaperModel = model<QuestionPaperDoc>('QuestionPaper', QuestionPaperSchema);
