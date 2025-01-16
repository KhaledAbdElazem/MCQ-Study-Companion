import React, { useState } from 'react';
import { useStudyStore } from '../stores/studyStore';
import { Sparkles, Frown } from 'lucide-react';
import Confetti from 'react-confetti';

export function QuizView() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSadFace, setShowSadFace] = useState(false);
  const { currentSet, currentQuestion, nextQuestion } = useStudyStore();

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === question.correctAnswer) {
      setShowConfetti(true);
      setShowSadFace(false);
    } else {
      setShowSadFace(true);
      setShowConfetti(false);
    }
  };

  const handleNext = () => {
    nextQuestion();
    setSelectedAnswer(null);
    setShowResult(false);
    setShowConfetti(false);
    setShowSadFace(false);
  };

  if (!currentSet || !currentSet.questions.length) {
    return (
      <div className="text-center p-6">
        <p className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
          No questions available. Please generate questions first.
        </p>
      </div>
    );
  }

  const question = currentSet.questions[currentQuestion];

  if (!question) {
    return (
      <div className="text-center p-6">
        <p className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
          All questions completed! Would you like to start over?
        </p>
        <button
          onClick={() => nextQuestion()}
          className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
            px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 
            transition-all duration-300 shadow-lg hover:shadow-xl font-bold"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Confetti for correct answers */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
          gravity={0.2}
        />
      )}

      {/* Sad face for wrong answers */}
      {showSadFace && (
        <div className="fixed top-20 left-0 right-0 z-50 flex justify-center p-4">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-center animate-bounce p-4">
            <Frown className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto" />
            <p className="text-xl font-semibold text-red-600 dark:text-red-400 mt-2">
              Oops! Not quite right...
            </p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-6 relative">
        <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200 mb-6">
          Quest {currentQuestion + 1} of {currentSet.questions.length}
        </h2>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 dark:bg-gray-800/80 dark:border-gray-700">
          <p className="text-xl font-semibold text-indigo-900 dark:text-indigo-200 mb-6">
            {question.question}
          </p>
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`w-full p-4 text-left rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg
                  ${
                    selectedAnswer === index
                      ? showResult
                        ? index === question.correctAnswer
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse'
                          : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-white hover:bg-purple-50 text-indigo-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                  }`}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
              >
                {option}
              </button>
            ))}
          </div>
          {showResult && (
            <div className="mt-6">
              <p className={`text-xl font-bold mb-4 ${
                selectedAnswer === question.correctAnswer 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {selectedAnswer === question.correctAnswer ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6" /> Correct! A true scholar!
                  </span>
                ) : (
                  '🔮 Not quite right...'
                )}
                {selectedAnswer !== question.correctAnswer && (
                  <span className="block mt-2 text-gray-700 dark:text-gray-300">
                    The correct answer is: {question.options[question.correctAnswer]}
                  </span>
                )}
              </p>
              <button
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
                  px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 
                  transition-all duration-300 shadow-lg hover:shadow-xl font-bold"
                onClick={handleNext}
              >
                Continue Quest
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}