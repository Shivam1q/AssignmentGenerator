export interface QuestionType {
  type: string;
  numQuestions: number;
  marksPerQuestion: number;
}

export interface Assignment {
  _id: string;
  title: string;
  schoolName: string;
  subject: string;
  className: string;
  dueDate: string;
  assignedOn: string;
  totalQuestions: number;
  totalMarks: number;
  questionTypes: QuestionType[];
  additionalInstructions: string;
  fileUrl: string | null;
}

export interface Question {
  number: number;
  text: string;
  difficulty: "Easy" | "Moderate" | "Challenging" | "Hard" | string;
  marks: number;
  options?: string[];
}

export interface Section {
  title: string;
  type: string;
  instruction: string;
  questions: Question[];
}

export interface AnswerKeyItem {
  number: number;
  answer: string;
}

export interface GeneratedPaper {
  _id: string;
  assignmentId: string;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  generalInstruction: string;
  sections: Section[];
  answerKey: AnswerKeyItem[];
  generatedAt: string;
  pdfUrl: string | null;
}

export interface AssignmentFormData {
  title: string;
  schoolName: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions: string;
  file: File | null;
}
