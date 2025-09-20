import React from 'react';
import { useAppContext } from '../context/AppContext';

const Courses = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Recommended Courses</h1>
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommended Courses</h1>
          <p className="text-gray-600">Curated learning resources to develop your skills</p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiResponse.courses.map((course, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-2xl">📚</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-gray-600 text-sm">{course.provider}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-medium text-gray-900">{course.duration}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Difficulty</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-center block"
                  >
                    View Course
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Course Categories */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Beginner</h3>
              <p className="text-gray-600 text-sm">
                Start your learning journey with foundational concepts
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Intermediate</h3>
              <p className="text-gray-600 text-sm">
                Build on your existing knowledge and skills
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced</h3>
              <p className="text-gray-600 text-sm">
                Master complex topics and advanced techniques
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Specialized</h3>
              <p className="text-gray-600 text-sm">
                Focus on specific career paths and technologies
              </p>
            </div>
          </div>
        </div>

        {/* Learning Tips */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl">
          <div className="p-8 text-white">
            <h2 className="text-2xl font-bold mb-6">Learning Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">📅 Set a Schedule</h3>
                <p className="text-primary-100 text-sm">
                  Dedicate consistent time each week to learning. Even 30 minutes daily can make a big difference.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🔄 Practice Regularly</h3>
                <p className="text-primary-100 text-sm">
                  Apply what you learn through projects and hands-on exercises to reinforce your knowledge.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">👥 Join Communities</h3>
                <p className="text-primary-100 text-sm">
                  Connect with other learners and professionals in your field for support and networking.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📝 Track Progress</h3>
                <p className="text-primary-100 text-sm">
                  Keep a learning journal to track your progress and identify areas for improvement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/roadmap"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <span className="mr-2">🗺️</span>
              View Learning Roadmap
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

export default Courses;
