import React from 'react';
import { useAppContext } from '../context/AppContext';

const Dashboard = () => {
  const { userSkills, userExpertise, aiResponse, error } = useAppContext();

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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Career Analysis</h1>
          <p className="text-gray-600">Based on your skills and expertise</p>
        </div>

        {/* User Input Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Skills</h3>
            <p className="text-gray-700">{userSkills}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Expertise</h3>
            <p className="text-gray-700">{userExpertise}</p>
          </div>
        </div>

        {/* Selected Career Path */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Recommended Career Path</h2>
            <p className="text-gray-600 mt-1">Your best match based on the analysis</p>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-primary-600 mb-3">
              {aiResponse.selected_path.title}
            </h3>
            <p className="text-gray-700 mb-4">{aiResponse.selected_path.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {aiResponse.selected_path.required_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Salary Range</h4>
                <p className="text-gray-700">{aiResponse.selected_path.salary_range}</p>
                <h4 className="font-semibold text-gray-900 mb-2 mt-3">Growth Prospect</h4>
                <p className="text-gray-700">{aiResponse.selected_path.growth_prospect}</p>
              </div>
            </div>
          </div>
        </div>

        {/* All Career Paths */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">All Career Paths</h2>
            <p className="text-gray-600 mt-1">Explore all recommended career options</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiResponse.career_paths.map((path, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{path.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{path.description}</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Salary: </span>
                      <span className="text-sm text-gray-600">{path.salary_range}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Growth: </span>
                      <span className="text-sm text-gray-600">{path.growth_prospect}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="/roadmap"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View Roadmap</h3>
                <p className="text-gray-600">See your step-by-step career journey</p>
              </div>
            </div>
          </a>

          <a
            href="/courses"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Browse Courses</h3>
                <p className="text-gray-600">Find courses to develop your skills</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
