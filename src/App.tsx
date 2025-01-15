import { BookOpen } from 'lucide-react';
import { QuizView } from './components/QuizView';
import { useStudyStore } from './stores/studyStore';
import { LectureUploader } from './components/LectureUploader';


export default function App() {
  const { currentSet } = useStudyStore();

  return (
   <>
   
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100">
      <header className="bg-indigo-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-serif flex items-center gap-2">
            <span className="text-2xl">📚</span> 
            Mystical MCQ Study Companion
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!currentSet ? (
          <div className="max-w-xl mx-auto">
            <h2 className="text-center text-2xl font-serif text-indigo-900 mb-6">
              Upload Your Lecture
            </h2>
            <LectureUploader />
          </div>
        ) : (
          <QuizView />
        )}
      </main>
      
    </div>

    </>
  );
}