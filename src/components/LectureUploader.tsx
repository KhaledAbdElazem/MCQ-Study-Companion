import React, { useState } from 'react';
import { generateMCQs, parseMCQs, testGeminiAPI } from '../services/geminiService';
import { useStudyStore } from '../stores/studyStore';
import { UploadCloud } from 'lucide-react'; // Import an icon for the upload button

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
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full transition-all duration-500" 
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
      
      <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-indigo-900 mb-6">
          Upload Your Lecture
        </h2>
        <label className="block cursor-pointer">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-purple-300 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-all duration-300">
            <UploadCloud className="w-12 h-12 text-purple-500 mb-4" />
            <span className="text-purple-700 font-semibold">
              Drag & drop or <span className="text-blue-600 underline">browse</span> your file
            </span>
            <span className="text-sm text-gray-500 mt-2">
              Supported formats: PDF, DOC, DOCX, TXT
            </span>
          </div>
          <input
            type="file"
            className="hidden"
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
          className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg"
        >
          Test API Connection
        </button>
      </div>
    </div>
  );
}