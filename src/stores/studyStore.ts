import { create } from 'zustand';

interface MCQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuestionSet {
  id: string;
  name: string;
  questions: MCQuestion[];
}

interface StudyStore {
  questionSets: QuestionSet[];
  currentSet: QuestionSet | null;
  currentQuestion: number;
  addQuestionSet: (questionSet: QuestionSet) => void;
  setCurrentSet: (id: string) => void;
  nextQuestion: () => void;
}

export const useStudyStore = create<StudyStore>((set) => ({
  questionSets: [],
  currentSet: null,
  currentQuestion: 0,
  addQuestionSet: (questionSet) => {
    console.log('Adding question set:', questionSet);
    set((state) => ({
      questionSets: [...state.questionSets, questionSet],
      currentSet: questionSet,
      currentQuestion: 0
    }));
  },
  setCurrentSet: (id) =>
    set((state) => ({
      currentSet: state.questionSets.find((set) => set.id === id) || null,
      currentQuestion: 0,
    })),
  nextQuestion: () =>
    set((state) => ({
      currentQuestion: state.currentSet 
        ? (state.currentQuestion + 1) % state.currentSet.questions.length 
        : 0
    })),
})); 