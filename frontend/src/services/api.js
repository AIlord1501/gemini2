import axios from 'axios';

// Token management
const TOKEN_KEY = 'career_analyzer_token';

export const tokenManager = {
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
  },
  
  initializeToken: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
};

// Initialize token on import
tokenManager.initializeToken();

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 30000, // 30 seconds timeout for AI requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail || error.response.data?.message || 'Server error';
      console.error(`Server Error (${error.response.status}):`, message);
      throw new Error(`Server Error: ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error: No response received', error.request);
      throw new Error('Network Error: Unable to connect to server. Please check if the backend is running.');
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
      throw new Error(`Request Error: ${error.message}`);
    }
  }
);

// API functions
export const careerAPI = {
  // Analyze career paths
  analyzeCareer: async (skills, expertise) => {
    try {
      console.log('analyzeCareer called with:', { skills, expertise });
      console.log('API base URL:', api.defaults.baseURL);
      
      const requestData = { skills, expertise };
      console.log('Making POST request to /analyze with data:', requestData);
      
      const response = await api.post('/analyze', requestData);
      console.log('analyzeCareer response status:', response.status);
      console.log('analyzeCareer response data:', response.data);
      
      if (!response.data) {
        throw new Error('Empty response from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('analyzeCareer error details:', {
        message: error.message,
        response: error.response,
        request: error.request,
        config: error.config
      });
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },

  // Generate mock test
  generateMockTest: async (skills, expertise, topic = null, userId = null) => {
    try {
      const requestData = {
        skills,
        expertise,
      };
      
      if (topic) {
        requestData.topic = topic;
      }
      
      const response = await api.post('/mock-test', requestData, {
        params: userId ? { user_id: userId } : {},
      });
      return response.data;
    } catch (error) {
      console.error('Mock test generation error:', error);
      throw error;
    }
  },

  // Authentication endpoints
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  updateMe: async (userData) => {
    try {
      const response = await api.put('/auth/me', userData);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  // Chat endpoints
  updateSkillsViaChat: async (message) => {
    try {
      const response = await api.post('/chat/update-skills', { message });
      return response.data;
    } catch (error) {
      console.error('Chat update skills error:', error);
      throw error;
    }
  },

  // Skills endpoints
  updateSkills: async (userId, message) => {
    try {
      const response = await api.post('/update-skills', {
        user_id: userId,
        message: message
      });
      return response.data;
    } catch (error) {
      console.error('Update skills error:', error);
      throw error;
    }
  },

  // Root endpoint
  getRoot: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Root endpoint error:', error);
      throw error;
    }
  },
};

// Export the analyzeCareer function directly for convenience
export const analyzeCareer = async (skills, expertise) => {
  try {
    const response = await api.post('/analyze', {
      skills,
      expertise,
    });
    return response.data;
  } catch (error) {
    console.error('Career analysis error:', error);
    throw error;
  }
};

// Export the generateMockTest function directly for convenience
export const generateMockTest = async (skills, expertise, topic = null, userId = null) => {
  try {
    const requestData = {
      skills,
      expertise,
    };
    
    if (topic) {
      requestData.topic = topic;
    }
    
    const response = await api.post('/mock-test', requestData, {
      params: userId ? { user_id: userId } : {},
    });
    return response.data;
  } catch (error) {
    console.error('Mock test generation error:', error);
    throw error;
  }
};

// Export the getResources function for learning resources
export const getResources = async ({ skills, expertise, limit = 5, topic = null }) => {
  try {
    const requestData = {
      skills,
      expertise,
      limit
    };
    
    // Only add topic if it's provided and not 'all'
    if (topic && topic !== 'all') {
      requestData.topic = topic;
    }
    
    const response = await api.post('/resources', requestData);
    return response.data;
  } catch (error) {
    console.error('Get resources error:', error);
    throw error;
  }
};

export default api;
