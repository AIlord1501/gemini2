import React from 'react';
import { useAppContext } from '../context/AppContext';

const CareerPath = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Career Paths</h1>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Paths</h1>
          <p className="text-gray-600">Explore all recommended career options for you</p>
        </div>

        {/* Selected Career Path - Featured */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl mb-8">
          <div className="p-8 text-white">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Recommended Path</h2>
                <p className="text-primary-100">Your best match</p>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-4">{aiResponse.selected_path.title}</h3>
            <p className="text-primary-100 text-lg mb-6">{aiResponse.selected_path.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {aiResponse.selected_path.required_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white bg-opacity-20 rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Salary Range</h4>
                <p className="text-primary-100">{aiResponse.selected_path.salary_range}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Growth Prospect</h4>
                <p className="text-primary-100">{aiResponse.selected_path.growth_prospect}</p>
              </div>
            </div>
          </div>
        </div>

        {/* All Career Paths */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiResponse.career_paths.map((path, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-lg">💼</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{path.title}</h3>
                    {path.title === aiResponse.selected_path.title && (
                      <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{path.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {path.required_skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">Salary Range</h4>
                      <p className="text-gray-700 text-sm">{path.salary_range}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">Growth Prospect</h4>
                      <p className="text-gray-700 text-sm">{path.growth_prospect}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/roadmap"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <span className="mr-2">🗺️</span>
              View Roadmap
            </a>
            <a
              href="/courses"
              className="inline-flex items-center px-6 py-3 bg-white text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <span className="mr-2">📚</span>
              Browse Courses
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerPath;
