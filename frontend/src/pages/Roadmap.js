import React from 'react';
import { useAppContext } from '../context/AppContext';

const Roadmap = () => {
  const { aiResponse, error } = useAppContext();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400 text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="mt-2 text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!aiResponse) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Career Roadmap</h1>
            <p className="text-gray-600 mb-8">
              No analysis data available. Please start by analyzing your career path.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start Analysis
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Career Roadmap</h1>
          <p className="text-gray-600">Step-by-step guide to achieve your career goals</p>
        </div>

        {/* Roadmap Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{aiResponse.selected_path.title}</h2>
                <p className="text-gray-600">Your recommended career path</p>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Steps */}
        <div className="space-y-6">
          {aiResponse.roadmap.map((step, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-start">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {step.step}
                    </div>
                  </div>
                  
                  {/* Step Content */}
                  <div className="ml-6 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                      <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                        {step.duration}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{step.description}</p>
                    
                    {/* Resources */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Resources & Tools</h4>
                      <div className="flex flex-wrap gap-2">
                        {step.resources.map((resource, resourceIndex) => (
                          <span
                            key={resourceIndex}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Indicator */}
              {index < aiResponse.roadmap.length - 1 && (
                <div className="px-6 pb-6">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="flex-1 h-0.5 bg-primary-200 ml-3"></div>
                    <div className="w-6 h-6 bg-primary-200 rounded-full ml-3"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Roadmap Summary */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl">
          <div className="p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Roadmap Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Total Steps</h3>
                <p className="text-2xl font-bold">{aiResponse.roadmap.length}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Estimated Duration</h3>
                <p className="text-2xl font-bold">6-18 months</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Career Path</h3>
                <p className="text-lg">{aiResponse.selected_path.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/courses"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <span className="mr-2">📚</span>
              View Recommended Courses
            </a>
            <a
              href="/career-path"
              className="inline-flex items-center px-6 py-3 bg-white text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <span className="mr-2">💼</span>
              Explore Career Paths
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
