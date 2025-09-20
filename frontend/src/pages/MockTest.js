import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateMockTest } from '../services/api';

const MockTest = () => {
  const { user, userSkills, userExpertise, mockTest, setMockTest, setLoading, setError, loading, error } = useAppContext();
  const [topic, setTopic] = useState('');
  const [expandedAnswers, setExpandedAnswers] = useState({});

  // Use user profile data if available, otherwise fall back to context skills
  const effectiveSkills = user?.skills || userSkills;
  const effectiveExpertise = user?.expertise || userExpertise;

  const handleGenerateTest = async () => {
    if (!effectiveSkills || !effectiveExpertise) {
      setError('Please complete your profile with skills and expertise first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const testData = await generateMockTest(effectiveSkills, effectiveExpertise, topic || null);
      setMockTest(testData);
    } catch (err) {
      setError(err.message || 'Failed to generate mock test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (questionIndex) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="mt-2 text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mock Test Generator</h1>
          <p className="text-xl text-gray-600">
            Generate personalized practice questions based on your skills and expertise.
          </p>
        </div>

        {/* Test Generation Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generate New Test</h2>
          
          {/* User Profile Summary */}
          {(effectiveSkills && effectiveExpertise) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Skills:</span>
                  <p className="text-gray-700">{effectiveSkills}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Expertise:</span>
                  <p className="text-gray-700">{effectiveExpertise}</p>
                </div>
              </div>
            </div>
          )}

          {/* Topic Input */}
          <div className="mb-6">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Specific Topic (Optional)
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Data Structures, Machine Learning, Web Development..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
            <p className="mt-2 text-sm text-gray-500">
              Leave empty for general questions based on your skills and expertise.
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateTest}
            disabled={loading || !effectiveSkills || !effectiveExpertise}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
              loading || !effectiveSkills || !effectiveExpertise
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Test...
              </div>
            ) : (
              'Generate Mock Test'
            )}
          </button>

          {!effectiveSkills || !effectiveExpertise ? (
            <p className="mt-4 text-sm text-red-600 text-center">
              Please complete your profile with skills and expertise before generating a test.
            </p>
          ) : null}
        </div>

        {/* Mock Test Results */}
        {mockTest && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Your Mock Test</h2>
              <div className="text-sm text-gray-500">
                Test ID: {mockTest.test_id}
              </div>
            </div>

            {/* Test Info */}
            <div className="bg-primary-50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📝</span>
                <h3 className="text-lg font-medium text-primary-900">Test Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-primary-700">Questions:</span>
                  <span className="ml-2 text-primary-600">{mockTest.questions.length}</span>
                </div>
                <div>
                  <span className="font-medium text-primary-700">Created:</span>
                  <span className="ml-2 text-primary-600">
                    {new Date(mockTest.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {mockTest.questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex-1">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-800 rounded-full text-sm font-bold mr-3">
                        {index + 1}
                      </span>
                      {question.question}
                    </h3>
                  </div>

                  {/* Toggle Answer Button */}
                  <button
                    onClick={() => toggleAnswer(index)}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      expandedAnswers[index]
                        ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {expandedAnswers[index] ? (
                      <>
                        <span className="mr-2">👁️</span>
                        Hide Answer
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💡</span>
                        Show Answer
                      </>
                    )}
                  </button>

                  {/* Collapsible Answer */}
                  {expandedAnswers[index] && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="text-sm font-medium text-green-800 mb-2">Answer:</h4>
                      <p className="text-green-700 leading-relaxed">{question.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGenerateTest}
                disabled={loading}
                className="flex-1 py-3 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Generate New Test
              </button>
              <button
                onClick={() => {
                  const allExpanded = mockTest.questions.every((_, index) => expandedAnswers[index]);
                  const newState = {};
                  mockTest.questions.forEach((_, index) => {
                    newState[index] = !allExpanded;
                  });
                  setExpandedAnswers(newState);
                }}
                className="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                {mockTest.questions.every((_, index) => expandedAnswers[index]) ? 'Hide All Answers' : 'Show All Answers'}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!mockTest && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Mock Test Generated Yet</h3>
            <p className="text-gray-600 mb-6">
              Click the "Generate Mock Test" button above to create your personalized practice questions.
            </p>
            <div className="text-sm text-gray-500">
              Your test will include 5 challenging questions tailored to your skills and expertise level.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTest;