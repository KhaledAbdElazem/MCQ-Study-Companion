import React, { useState } from 'react';
import { generateMCQs, parseMCQs, testGeminiAPI } from '../services/geminiService';
import { useStudyStore } from '../stores/studyStore';

export function LectureUploader() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { addQuestionSet } = useStudyStore();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);

    try {
      // Read file as ArrayBuffer for PDFs
      const buffer = await file.arrayBuffer();
      console.log('File loaded as ArrayBuffer');
      
      const mcqText = await generateMCQs(buffer, (progress) => {
        setProgress(progress);
      });
      
      console.log('Raw MCQ text:', mcqText);
      const questions = parseMCQs(mcqText);
      
      if (questions.length === 0) {
        throw new Error('No valid questions were generated');
      }

      console.log('Parsed questions:', questions);
      
      const questionSet = {
        id: Date.now().toString(),
        name: file.name,
        questions
      };
      
      console.log('Adding question set:', questionSet);
      addQuestionSet(questionSet);
      setSuccess(true);
      setProgress(100);
      
    } catch (err) {
      setError(
        err.message.includes('429') 
          ? 'API rate limit reached. Please wait a few minutes and try again.'
          : 'Failed to generate questions. Please try again.'
      );
      console.error('Error generating questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testAPI = async () => {
    try {
      setIsLoading(true);
      const isWorking = await testGeminiAPI();
      if (isWorking) {
        alert('API is working correctly!');
      } else {
        alert('API test failed. Please check your API key and quota.');
      }
    } catch (error) {
      console.error('API test error:', error);
      alert('Error testing API: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center">
      {isLoading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
            <div 
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            Generating questions... {progress}%
          </p>
        </div>
      )}
      
      {success && (
        <div 
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
        >
          <p className="font-bold">Questions generated successfully!</p>
          <p className="text-sm">The quiz will start automatically...</p>
        </div>
      )}
      
      <div className="max-w-xl mx-auto">
        <label className="block">
          <span className="sr-only">Choose lecture file</span>
          <input
            type="file"
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100
              disabled:opacity-50"
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={isLoading}
          />
        </label>

        {error && (
          <div className="mt-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={testAPI}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test API Connection
        </button>
      </div>
    </div>
  );
} 