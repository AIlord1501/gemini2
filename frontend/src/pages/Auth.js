import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSuccess = (user) => {
    // Redirect to dashboard after successful authentication
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Toggle between Login and Register */}
        <div className="flex justify-center">
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                isLogin
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                !isLogin
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Render Login or Register component */}
        {isLogin ? (
          <Login onSuccess={handleSuccess} />
        ) : (
          <Register onSuccess={handleSuccess} />
        )}

        {/* Switch form link */}
        <div className="text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;