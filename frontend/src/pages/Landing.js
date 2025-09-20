import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { careerAPI } from '../services/api';

const Landing = () => {
  const navigate = useNavigate();
  const { setSkills, setExpertise, setAIResponse, setLoading, setError, loading, error } = useAppContext();
  const [formData, setFormData] = useState({
    skills: '',
    expertise: '',
  });

  const expertiseLevels = [
    { value: 'Beginner', label: 'Beginner (0-2 years experience)' },
    { value: 'Intermediate', label: 'Intermediate (2-5 years experience)' },
    { value: 'Advanced', label: 'Advanced (5+ years experience)' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    // Enhanced validation
    if (!formData.skills.trim()) {
      console.log('Validation failed: No skills entered');
      setError('Please enter your skills');
      return;
    }
    
    if (formData.skills.trim().length < 3) {
      console.log('Validation failed: Skills too short');
      setError('Please enter at least 3 characters for skills');
      return;
    }
    
    if (!formData.expertise) {
      console.log('Validation failed: No expertise selected');
      setError('Please select your experience level');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting career analysis request...');
      console.log('API Base URL:', careerAPI);
      
      // Update context with form data
      setSkills(formData.skills.trim());
      setExpertise(formData.expertise);
      
      // Call API
      console.log('Calling analyzeCareer with:', {
        skills: formData.skills.trim(),
        expertise: formData.expertise
      });
      
      const response = await careerAPI.analyzeCareer(formData.skills.trim(), formData.expertise);
      console.log('Career analysis response received:', response);
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      if (!response.career_paths || !Array.isArray(response.career_paths)) {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response from server - missing career paths');
      }
      
      console.log('Setting AI response and navigating to dashboard...');
      setAIResponse(response);
      
      // Small delay to ensure state is set
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
      
    } catch (error) {
      console.error('Career analysis failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      let errorMessage = 'Failed to analyze career path. ';
      
      if (error.message.includes('Network Error')) {
        errorMessage += 'Please check your internet connection and ensure the backend server is running.';
      } else if (error.message.includes('Server Error')) {
        errorMessage += 'The server encountered an error. Please try again in a moment.';
      } else {
        errorMessage += 'Please try again or contact support if the problem persists.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            AI Career Path Finder
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover your ideal career path with AI-powered analysis. Get personalized 
            recommendations, roadmaps, and course suggestions tailored to your skills and experience.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-400 text-xl">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Skills
                </label>
                <textarea
                  id="skills"
                  name="skills"
                  rows={4}
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g., Python, JavaScript, React, Project Management, Data Analysis, Leadership..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                  minLength={3}
                />
                <p className="mt-2 text-sm text-gray-500">
                  List your skills separated by commas (technical skills, soft skills, tools, etc.)
                </p>
              </div>

              <div>
                <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  id="expertise"
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                >
                  <option value="">Select your experience level</option>
                  {expertiseLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  Choose the level that best describes your professional experience
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Analyzing Your Career Path...
                  </div>
                ) : (
                  'Find My Career Path'
                )}
              </button>
              
              {/* Debug button for testing */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    console.log('Testing API connection...');
                    const testResponse = await careerAPI.healthCheck();
                    console.log('Health check response:', testResponse);
                    alert('✅ Backend connection successful!');
                  } catch (error) {
                    console.error('Health check failed:', error);
                    alert('❌ Backend connection failed: ' + error.message);
                  }
                }}
                className="w-full mt-2 bg-gray-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-600 transition-colors"
              >
                🔧 Test Backend Connection
              </button>
            </form>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Paths</h3>
              <p className="text-gray-600">
                Get personalized career recommendations based on your skills and experience
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Roadmaps</h3>
              <p className="text-gray-600">
                Step-by-step guides to help you achieve your career goals
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Courses</h3>
              <p className="text-gray-600">
                Curated learning resources to develop the skills you need
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
