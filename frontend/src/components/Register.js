import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { careerAPI, tokenManager } from '../services/api';

const Register = ({ onSuccess }) => {
  const { setUser, setLoading, setError, loading, error } = useAppContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    skills: '',
    expertise: '',
  });

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

    try {
      const response = await careerAPI.register(formData);
      
      // Store token and user data
      tokenManager.setToken(response.access_token);
      setUser(response.user);
      
      if (onSuccess) {
        onSuccess(response.user);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Enter your password"
          />
        </div>

        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
            Skills (Optional)
          </label>
          <textarea
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="e.g., JavaScript, Python, React, Data Analysis..."
          />
        </div>

        <div>
          <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-2">
            Expertise Level (Optional)
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
              Creating Account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
};

export default Register;