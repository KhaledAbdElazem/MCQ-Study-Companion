import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { QuizView } from './components/QuizView';
import { useStudyStore } from './stores/studyStore';
import { LectureUploader } from './components/LectureUploader';
import { Moon, Sun } from 'lucide-react'; // Icons for dark mode toggle

export default function App() {
  const { currentSet } = useStudyStore();
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Persist dark mode preference in localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Disable scrolling when the app mounts
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll'); // Re-enable scrolling when the app unmounts
    };
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <header className="bg-indigo-800 text-white py-4 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <h1 className="text-2xl font-serif flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Mystical MCQ Study Companion
            </h1>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {!currentSet ? (
            <div className="max-w-xl mx-auto">
              <h2 className="text-center text-2xl font-serif text-indigo-900 dark:text-indigo-200 mb-6">
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