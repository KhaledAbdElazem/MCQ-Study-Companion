export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuestionSet {
  id: string;
  name: string;
  questions: Question[];
}