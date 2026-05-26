// Types shared between backend and frontend.

export type QuestionTypeKind =
  | 'mcq'
  | 'short'
  | 'long'
  | 'diagram'
  | 'numerical';

export interface QuestionTypeSpec {
  type: QuestionTypeKind;
  count: number;
  marks: number;
}

export interface AssignmentFileMeta {
  name: string;
  sizeBytes: number;
  mimeType: string;
}

export type AssignmentStatus =
  | 'draft'
  | 'queued'
  | 'processing'
  | 'generating'
  | 'saving'
  | 'completed'
  | 'failed';

export interface Assignment {
  _id: string;
  userId: string;
  title: string;
  fileMeta?: AssignmentFileMeta;
  dueDate: string; // ISO
  questionTypes: QuestionTypeSpec[];
  additionalInstructions?: string;
  status: AssignmentStatus;
  jobId?: string;
  paperId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export type Difficulty = 'easy' | 'moderate' | 'hard';

export interface PaperQuestion {
  id: string;
  text: string;
  difficulty: Difficulty;
  marks: number;
}

export interface PaperSection {
  id: string; // 'A', 'B', ...
  title: string;
  instruction: string;
  questions: PaperQuestion[];
}

export interface PaperMeta {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  generalInstructions: string;
}

export interface AnswerKeyEntry {
  questionId: string;
  answer: string;
}

export interface QuestionPaper {
  _id: string;
  assignmentId: string;
  meta: PaperMeta;
  sections: PaperSection[];
  answerKey?: AnswerKeyEntry[];
  totals: { questions: number; marks: number };
  createdAt: string;
}

// WebSocket payloads from server → client, scoped to a single assignment room.
export type JobEvent =
  | {
      type: 'status';
      status: AssignmentStatus;
      progress: number; // 0-100
      message?: string;
    }
  | { type: 'completed'; paperId: string }
  | { type: 'error'; message: string };

export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  school: string;
  role: 'teacher';
}
