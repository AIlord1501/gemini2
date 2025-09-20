import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const Settings = () => {
  const { userSkills, userExpertise, setSkills, setExpertise, clearData } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    skills: userSkills,
    expertise: userExpertise,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setSkills(formData.skills);
    setExpertise(formData.expertise);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      skills: userSkills,
      expertise: userExpertise,
    });
    setIsEditing(false);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your profile and application preferences</p>
        </div>

        <div className="space-y-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {isEditing ? (
                <div className="space-y-6">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Experience & Expertise
                    </label>
                    <textarea
                      id="expertise"
                      name="expertise"
                      rows={4}
                      value={formData.expertise}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Skills</label>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{userSkills || 'No skills specified'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Experience & Expertise</label>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{userExpertise || 'No expertise specified'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Application Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Application Settings</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">API Endpoint</h3>
                  <p className="text-gray-600">Backend server URL for career analysis</p>
                </div>
                <div className="text-sm text-gray-500">
                  {process.env.REACT_APP_API_URL || 'http://localhost:8000'}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Theme</h3>
                  <p className="text-gray-600">Application appearance and styling</p>
                </div>
                <div className="text-sm text-gray-500">Light Mode</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                  <p className="text-gray-600">Receive updates about new features</p>
                </div>
                <div className="text-sm text-gray-500">Enabled</div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Data Management</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Clear All Data</h3>
                  <p className="text-gray-600">Remove all stored information and start fresh</p>
                </div>
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Data
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Export Data</h3>
                  <p className="text-gray-600">Download your career analysis data</p>
                </div>
                <button
                  disabled
                  className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  Export (Coming Soon)
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">About</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Version</span>
                <span className="text-gray-900 font-medium">1.0.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Last Updated</span>
                <span className="text-gray-900 font-medium">Today</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">AI Model</span>
                <span className="text-gray-900 font-medium">Gemini 1.0 Pro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
