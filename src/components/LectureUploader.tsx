import React, { useState, useEffect } from 'react';
import { generateMCQs, parseMCQs, testGeminiAPI } from '../services/geminiService';
import { useStudyStore } from '../stores/studyStore';
import { UploadCloud, Loader2 } from 'lucide-react';

export function LectureUploader() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(''); // Dynamic loading message
  const [startTime, setStartTime] = useState<number | null>(null); // Track start time
  const { addQuestionSet } = useStudyStore();

  // List of dynamic loading messages
  const loadingMessages = [
    'Processing your file...',
    'Analyzing lecture content...',
    'Generating questions...',
    'This may take a minute...',
    'Almost there...',
    'Finalizing your quiz...',
    'Hang tight! Magic is happening...',
  ];

  // Update the loading message based on elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && startTime) {
      interval = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000; // Elapsed time in seconds
        if (elapsedTime >= 70) {
          // Show the final message when 70 seconds have passed
          setLoadingMessage('Almost done!');
        } else {
          // Cycle through the messages every 10 seconds
          const messageIndex = Math.floor(elapsedTime / 10) % loadingMessages.length;
          setLoadingMessage(loadingMessages[messageIndex]);
        }
      }, 1000); // Update every second
    }
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [isLoading, startTime]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);
    setStartTime(Date.now()); // Set the start time when processing begins

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
      setStartTime(null); // Reset start time when processing is done
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
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
    <div
      className="min-h-screen"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 dark:bg-gray-800/90 p-8 rounded-lg shadow-lg text-center">
            <UploadCloud className="w-12 h-12 text-purple-500 dark:text-purple-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">
              Drop your file to upload
            </p>
          </div>
        </div>
      )}

      <div className="text-center">
        {isLoading ? (
          <div className="fixed inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-500 dark:text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-4">
                {loadingMessage} {/* Dynamic loading message */}
              </p>
              <div className="w-64 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mx-auto">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {progress}% complete
              </p>
            </div>
          </div>
        ) : (
          <>
            {success && (
              <div 
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 dark:bg-green-900 dark:border-green-800 dark:text-green-200"
              >
                <p className="font-bold">Questions generated successfully!</p>
                <p className="text-sm">The quiz will start automatically...</p>
              </div>
            )}
            
            <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 dark:bg-gray-800/80 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200 mb-6">
                Upload Your Lecture
              </h2>
              <label className="block cursor-pointer">
                <div
                  className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-all duration-300 ${
                    isDragging
                      ? 'border-purple-500 bg-purple-100 dark:bg-gray-700'
                      : 'border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 dark:from-gray-700 dark:to-gray-800 dark:border-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-700'
                  }`}
                >
                  <UploadCloud className="w-12 h-12 text-purple-500 dark:text-purple-400 mb-4" />
                  <span className="text-purple-700 font-semibold dark:text-purple-300">
                    Drag & drop or <span className="text-blue-600 underline dark:text-blue-400">browse</span> your file
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Supported formats: PDF, DOC, DOCX, TXT
                  </span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileInputChange}
                  disabled={isLoading}
                />
              </label>

              {error && (
                <div className="mt-4 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={testAPI}
                disabled={isLoading}
                className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Testing...' : 'Test API Connection'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}