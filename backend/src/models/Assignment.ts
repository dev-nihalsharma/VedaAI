import { Schema, model, Types } from 'mongoose';

const QuestionTypeSpecSchema = new Schema(
  {
    type: { type: String, enum: ['mcq', 'short', 'long', 'diagram', 'numerical'], required: true },
    count: { type: Number, required: true, min: 1, max: 50 },
    marks: { type: Number, required: true, min: 1, max: 50 },
  },
  { _id: false }
);

const FileMetaSchema = new Schema(
  {
    name: String,
    sizeBytes: Number,
    mimeType: String,
  },
  { _id: false }
);

const AssignmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 120 },
    fileMeta: { type: FileMetaSchema, required: false },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [QuestionTypeSpecSchema], required: true },
    additionalInstructions: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'queued', 'processing', 'generating', 'saving', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },
    jobId: String,
    paperId: { type: Schema.Types.ObjectId, ref: 'QuestionPaper' },
    errorMessage: String,
  },
  { timestamps: true }
);

export type AssignmentDoc = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  fileMeta?: { name: string; sizeBytes: number; mimeType: string };
  dueDate: Date;
  questionTypes: { type: string; count: number; marks: number }[];
  additionalInstructions: string;
  status: string;
  jobId?: string;
  paperId?: Types.ObjectId;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const AssignmentModel = model<AssignmentDoc>('Assignment', AssignmentSchema);
