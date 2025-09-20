import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  userSkills: '',
  userExpertise: '',
  aiResponse: null,
  loading: false,
  error: null,
};

// Action types
const ActionTypes = {
  SET_SKILLS: 'SET_SKILLS',
  SET_EXPERTISE: 'SET_EXPERTISE',
  SET_AI_RESPONSE: 'SET_AI_RESPONSE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_DATA: 'CLEAR_DATA',
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

  const setLoading = (loading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  };

  const clearData = () => {
    dispatch({ type: ActionTypes.CLEAR_DATA });
  };

  const value = {
    ...state,
    setSkills,
    setExpertise,
    setAIResponse,
    setLoading,
    setError,
    clearData,
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
