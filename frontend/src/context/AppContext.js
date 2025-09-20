import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { careerAPI, tokenManager, getResources } from '../services/api';

// Initial state
const initialState = {
  userSkills: '',
  userExpertise: '',
  aiResponse: null,
  mockTest: null,
  resources: { youtube_courses: [], articles: [] },
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Action types
const ActionTypes = {
  SET_SKILLS: 'SET_SKILLS',
  SET_EXPERTISE: 'SET_EXPERTISE',
  SET_AI_RESPONSE: 'SET_AI_RESPONSE',
  SET_MOCK_TEST: 'SET_MOCK_TEST',
  SET_RESOURCES: 'SET_RESOURCES',
  SET_USER: 'SET_USER',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_DATA: 'CLEAR_DATA',
  LOGOUT: 'LOGOUT',
  UPDATE_USER_SKILLS: 'UPDATE_USER_SKILLS',
  TRIGGER_REANALYSIS: 'TRIGGER_REANALYSIS',
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_SKILLS:
      return {
        ...state,
        userSkills: action.payload,
        error: null,
      };
    case ActionTypes.SET_EXPERTISE:
      return {
        ...state,
        userExpertise: action.payload,
        error: null,
      };
    case ActionTypes.SET_AI_RESPONSE:
      return {
        ...state,
        aiResponse: action.payload,
        loading: false,
        error: null,
      };
    case ActionTypes.SET_MOCK_TEST:
      return {
        ...state,
        mockTest: action.payload,
        loading: false,
        error: null,
      };
    case ActionTypes.SET_RESOURCES:
      return {
        ...state,
        resources: action.payload,
        loading: false,
        error: null,
      };
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null,
        // Update skills in context when user is updated
        userSkills: action.payload?.skills || state.userSkills,
        userExpertise: action.payload?.expertise || state.userExpertise,
      };
    case ActionTypes.UPDATE_USER_SKILLS:
      return {
        ...state,
        user: action.payload.user,
        userSkills: action.payload.user?.skills || state.userSkills,
        userExpertise: action.payload.user?.expertise || state.userExpertise,
        // Clear previous AI response to trigger re-analysis
        aiResponse: null,
        // Set loading to indicate analysis is being updated
        loading: true,
        error: null,
      };
    case ActionTypes.TRIGGER_REANALYSIS:
      return {
        ...state,
        aiResponse: null,
        loading: true,
        error: null,
      };
    case ActionTypes.SET_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload,
        loading: false,
        error: null,
      };
    case ActionTypes.LOGOUT:
      return {
        ...initialState,
      };
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null,
      };
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case ActionTypes.CLEAR_DATA:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize user on app start
  useEffect(() => {
    const initializeUser = async () => {
      const token = tokenManager.getToken();
      if (token) {
        try {
          const user = await careerAPI.getMe();
          setUser(user);
        } catch (error) {
          console.error('Failed to get user:', error);
          // Token might be expired, remove it
          tokenManager.removeToken();
        }
      }
    };

    initializeUser();
  }, []);

  // Action creators
  const setSkills = (skills) => {
    dispatch({ type: ActionTypes.SET_SKILLS, payload: skills });
  };

  const setExpertise = (expertise) => {
    dispatch({ type: ActionTypes.SET_EXPERTISE, payload: expertise });
  };

  const setAIResponse = (response) => {
    dispatch({ type: ActionTypes.SET_AI_RESPONSE, payload: response });
  };

  const setMockTest = (mockTest) => {
    dispatch({ type: ActionTypes.SET_MOCK_TEST, payload: mockTest });
  };

  const setResources = (resources) => {
    dispatch({ type: ActionTypes.SET_RESOURCES, payload: resources });
  };

  const setUser = (user) => {
    dispatch({ type: ActionTypes.SET_USER, payload: user });
  };

  const setAuthenticated = (isAuthenticated) => {
    dispatch({ type: ActionTypes.SET_AUTHENTICATED, payload: isAuthenticated });
  };

  const logout = () => {
    dispatch({ type: ActionTypes.LOGOUT });
  };

  const setLoading = (loading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  };

  const clearData = () => {
    dispatch({ type: ActionTypes.CLEAR_DATA });
  };

  // New action for updating user skills from ChatBot
  const updateUserSkills = (user) => {
    dispatch({ type: ActionTypes.UPDATE_USER_SKILLS, payload: { user } });
  };

  // New action to trigger re-analysis when skills change
  const triggerReanalysis = () => {
    dispatch({ type: ActionTypes.TRIGGER_REANALYSIS });
  };

  // Auto re-analyze when skills change significantly
  const autoReanalyze = async (newSkills, newExpertise) => {
    if (!newSkills || !newExpertise) {
      console.warn('Missing skills or expertise for auto re-analysis');
      return;
    }
    
    try {
      console.log('AppContext: Starting auto re-analysis with skills:', newSkills);
      setLoading(true);
      
      const response = await careerAPI.analyzeCareer(newSkills, newExpertise);
      
      // Update all relevant state
      setAIResponse(response);
      setSkills(newSkills);
      setExpertise(newExpertise);
      
      console.log('AppContext: Auto re-analysis completed successfully');
      console.log('Updated career paths:', response.career_paths?.length || 0);
      console.log('Updated roadmap steps:', response.roadmap?.length || 0);
      console.log('Updated courses:', response.courses?.length || 0);
      
      return response;
    } catch (error) {
      console.error('AppContext: Auto re-analysis failed:', error);
      setError(error.message || 'Failed to update career analysis');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update resources based on current user skills and expertise
  const updateResources = async (limit = 5) => {
    const skills = state.userSkills || 'General Technology';
    const expertise = state.userExpertise || 'beginner';
    
    if (!skills) {
      console.warn('No skills available for resource recommendations');
      return;
    }
    
    try {
      console.log('AppContext: Updating resources with skills:', skills, 'expertise:', expertise);
      setLoading(true);
      
      const response = await getResources({
        skills,
        expertise,
        limit
      });
      
      // Update resources state
      setResources({
        youtube_courses: response.youtube_courses || [],
        articles: response.articles || []
      });
      
      console.log('AppContext: Resources updated successfully');
      console.log('YouTube courses:', response.youtube_courses?.length || 0);
      console.log('Articles:', response.articles?.length || 0);
      
      return response;
    } catch (error) {
      console.error('AppContext: Failed to update resources:', error);
      setError(error.message || 'Failed to load learning resources');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    ...state,
    setSkills,
    setExpertise,
    setAIResponse,
    setMockTest,
    setResources,
    setUser,
    setAuthenticated,
    setLoading,
    setError,
    clearData,
    logout,
    updateUserSkills,
    triggerReanalysis,
    autoReanalyze,
    updateResources,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;

// Named export for compatibility
export { AppContext };
