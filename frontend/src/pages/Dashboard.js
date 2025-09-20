import React from 'react';
import { Link } from 'react-router-dom';
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
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start Analysis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h1>
          <p className="text-xl text-gray-600 mb-8">
            Here's your personalized career analysis based on your skills and experience.
          </p>
          
          {/* User Input Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Profile</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your Skills</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{userSkills}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Experience Level</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{userExpertise}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Career Paths Card */}
          <Link
            to="/career-path"
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">💼</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Career Paths</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Explore all recommended career options tailored to your skills and experience.
              </p>
              <div className="text-primary-600 font-medium">
                View Paths →
              </div>
            </div>
          </Link>

          {/* Roadmap Card */}
          <Link
            to="/roadmap"
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🗺️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Roadmap</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Follow a step-by-step guide to achieve your career goals and milestones.
              </p>
              <div className="text-green-600 font-medium">
                View Roadmap →
              </div>
            </div>
          </Link>

          {/* Courses Card */}
          <Link
            to="/courses"
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Courses</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Discover curated learning resources and courses to develop your skills.
              </p>
              <div className="text-blue-600 font-medium">
                Browse Courses →
              </div>
            </div>
          </Link>

          {/* Mock Test Card */}
          <Link
            to="/mock-test"
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Mock Test</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Take practice tests to assess and improve your knowledge and skills.
              </p>
              <div className="text-purple-600 font-medium">
                Take Test →
              </div>
            </div>
          </Link>

          {/* Settings Card */}
          <Link
            to="/settings"
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Settings</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Manage your profile, preferences, and application settings.
              </p>
              <div className="text-gray-600 font-medium">
                View Settings →
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        {aiResponse && (
          <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl">
            <div className="p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Your Analysis Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Career Paths</h3>
                  <p className="text-2xl font-bold">{aiResponse.career_paths.length}</p>
                  <p className="text-primary-100 text-sm">Recommended options</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Roadmap Steps</h3>
                  <p className="text-2xl font-bold">{aiResponse.roadmap.length}</p>
                  <p className="text-primary-100 text-sm">Action items</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Courses</h3>
                  <p className="text-2xl font-bold">{aiResponse.courses.length}</p>
                  <p className="text-primary-100 text-sm">Learning resources</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
