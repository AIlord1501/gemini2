import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { careerAPI } from '../services/api';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { user, setUser, isAuthenticated, setLoading, setError, loading, error } = useAppContext();
  const [formData, setFormData] = useState({
    full_name: '',
    skills: '',
    expertise: '',
  });
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        skills: user.skills || '',
        expertise: user.expertise || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaveMessage('');

    try {
      const updatedUser = await careerAPI.updateMe(formData);
      setUser(updatedUser);
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Settings</h1>
            <p className="text-gray-600 mb-8">
              Please log in to access your settings.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Login / Register
            </Link>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Profile Settings</h1>
          <p className="text-xl text-gray-600">
            Manage your profile information and preferences.
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Update Profile</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {saveMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700">{saveMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="e.g., JavaScript, Python, React, Data Analysis, Project Management..."
              />
            </div>

            <div>
              <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-2">
                Expertise Level
              </label>
              <select
                id="expertise"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="">Select your level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>

          {/* Account Information */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-gray-700">{user?.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Member Since:</span>
                <p className="text-gray-700">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
