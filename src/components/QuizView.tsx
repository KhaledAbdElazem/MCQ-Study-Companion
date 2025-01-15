import React, { useState } from 'react';
import { useStudyStore } from '../stores/studyStore';

export function QuizView() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const { currentSet, currentQuestion, nextQuestion } = useStudyStore();
  
  if (!currentSet || !currentSet.questions.length) {
    return (
      <div className="text-center p-6">
        <p className="text-lg font-serif text-indigo-900">
          No questions available. Please generate questions first.
        </p>
      </div>
    );
  }
  
  const question = currentSet.questions[currentQuestion];
  
  if (!question) {
    return (
      <div className="text-center p-6">
        <p className="text-lg font-serif text-indigo-900">
          All questions completed! Would you like to start over?
        </p>
        <button
          onClick={() => nextQuestion()}
          className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
            px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 
            transition-all duration-300 shadow-md hover:shadow-lg font-serif"
        >
          Start Over
        </button>
      </div>
    );
  }

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
  };

  const handleNext = () => {
    nextQuestion();
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-serif text-indigo-900 mb-4">
        Quest {currentQuestion + 1} of {currentSet.questions.length}
      </h2>
      <div className="bg-white/80 rounded-lg shadow-lg p-6 border-2 border-purple-200">
        <p className="text-lg mb-4 font-serif text-indigo-900">{question.question}</p>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`w-full p-3 text-left rounded-lg border-2 font-serif
                ${
                  selectedAnswer === index
                    ? showResult
                      ? index === question.correctAnswer
                        ? 'bg-green-100 border-green-500 shadow-green-200'
                        : 'bg-red-100 border-red-500 shadow-red-200'
                      : 'bg-purple-100 border-purple-500 shadow-purple-200'
                    : 'border-purple-200 hover:bg-purple-50 hover:border-purple-400'
                }
                transition-all duration-300 shadow-md hover:shadow-lg`}
              onClick={() => handleAnswer(index)}
              disabled={showResult}
            >
              {option}
            </button>
          ))}
        </div>
        {showResult && (
          <div className="mt-6">
            <p className={`font-serif text-lg ${
              selectedAnswer === question.correctAnswer 
                ? 'text-emerald-600' 
                : 'text-rose-600'
            } mb-4`}>
              {selectedAnswer === question.correctAnswer ? '✨ Correct! A true scholar!' : '🔮 Not quite right...'}
              {selectedAnswer !== question.correctAnswer && (
                <span className="block mt-2">
                  The ancient texts reveal: {question.options[question.correctAnswer]}
                </span>
              )}
            </p>
            <button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
                px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 
                transition-all duration-300 shadow-md hover:shadow-lg font-serif"
              onClick={handleNext}
            >
              Continue Quest
            </button>
          </div>
        )}
      </div>
    </div>
  );
}