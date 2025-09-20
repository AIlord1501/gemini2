import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { careerAPI } from '../services/api';

// Local storage key for conversation history
const CHAT_HISTORY_KEY = 'career_chatbot_history';

const ChatBot = () => {
  const { user, isAuthenticated, updateUserSkills, autoReanalyze, setUser, loading } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    // Load conversation history from localStorage
    const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (savedHistory) {
      try {
        return JSON.parse(savedHistory);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
    // Default welcome message
    return [
      {
        id: 1,
        text: "Hi! I'm your skills tracking assistant. Tell me about any new skills, technologies, or courses you've been learning!",
        isBot: true,
        timestamp: new Date()
      }
    ];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewSkills, setHasNewSkills] = useState(false);
  const messagesEndRef = useRef(null);

  // Save conversation history to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      let response;
      
      console.log('ChatBot: Sending message', { isAuthenticated, userId: user?.id, message: inputText });
      
      if (isAuthenticated && user?.id) {
        // Use the new update-skills endpoint for authenticated users
        console.log('ChatBot: Using authenticated flow');
        response = await careerAPI.updateSkills(user.id, inputText);
        
        // Update user context with the updated user data
        if (response.user) {
          // Use setUser if updateUserSkills is not available
          if (updateUserSkills) {
            updateUserSkills(response.user);
          } else {
            setUser(response.user);
          }
          
          // Check if new skills were added and trigger auto re-analysis
          if (response.extracted_skills && response.extracted_skills.length > 0) {
            setHasNewSkills(true);
            
            // Auto re-analyze with updated skills - call /analyze endpoint
            setTimeout(async () => {
              try {
                console.log('ChatBot: Triggering career analysis with updated skills');
                // eslint-disable-next-line no-unused-vars
                const analysisResponse = await careerAPI.analyzeCareer(
                  response.user.skills, 
                  response.user.expertise
                );
                
                // Update global context with new analysis
                if (autoReanalyze) {
                  await autoReanalyze(response.user.skills, response.user.expertise);
                } else {
                  // Fallback: manually update context if autoReanalyze not available
                  console.log('ChatBot: Analysis completed, updating global context');
                  // You could dispatch an action here to update the analysis in global state
                }
                
                console.log('ChatBot: Career analysis updated successfully');
                
                // Add a follow-up message to inform the user
                const followUpMessage = {
                  id: Date.now() + 2,
                  text: "🎉 Great news! I've successfully updated your career analysis with your new skills. Check out your Dashboard, Career Paths, Roadmap, and Courses to see the refreshed recommendations!",
                  isBot: true,
                  timestamp: new Date(),
                  isAnalysisUpdate: true
                };
                
                setMessages(prev => [...prev, followUpMessage]);
                
              } catch (error) {
                console.warn('ChatBot: Auto re-analysis failed:', error);
                
                // Add error message to chat
                const errorMessage = {
                  id: Date.now() + 2,
                  text: "I've updated your skills, but there was an issue refreshing your career analysis. You can manually refresh by visiting the Dashboard.",
                  isBot: true,
                  timestamp: new Date(),
                  isError: true
                };
                
                setMessages(prev => [...prev, errorMessage]);
              }
            }, 1000);
          }
        }

        // Create bot response message
        const skillsText = response.extracted_skills.length > 0 
          ? `I found these skills: ${response.extracted_skills.map(s => `${s.skill} (${s.expertise_level})`).join(', ')}. I've updated your profile and am now refreshing your career analysis with these new skills!`
          : "I didn't find any new skills in that message, but thanks for sharing!";
        
        const botMessage = {
          id: Date.now() + 1,
          text: skillsText,
          isBot: true,
          timestamp: new Date(),
          extractedSkills: response.extracted_skills.map(s => s.skill),
          updatedSkillsList: response.updated_skills_list,
          hasSkillUpdate: response.extracted_skills.length > 0
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        // Use the chat endpoint for non-authenticated users
        console.log('ChatBot: Using non-authenticated flow');
        try {
          response = await careerAPI.updateSkillsViaChat(inputText);
        } catch (error) {
          // Fallback for non-authenticated users
          console.log('ChatBot: Chat endpoint not available, providing generic response');
          const botMessage = {
            id: Date.now() + 1,
            text: "Thanks for sharing! To save skills to your profile and get personalized recommendations, please register or log in. I can still help you explore your learning journey!",
            isBot: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
          return;
        }
        
        // Add bot response
        const botMessage = {
          id: Date.now() + 1,
          text: response.bot_message || "Thanks for sharing your learning progress!",
          isBot: true,
          timestamp: new Date(),
          extractedSkills: response.extracted_skills || []
        };

        setMessages(prev => [...prev, botMessage]);
      }

    } catch (error) {
      console.error('ChatBot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: error.message.includes('User not found') 
          ? "Please log in first to save skills to your profile. I can still chat with you about your learning journey!"
          : "Sorry, I'm having trouble processing your message right now. Please try again later.",
        isBot: true,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChatHistory = () => {
    const defaultMessage = {
      id: 1,
      text: "Hi! I'm your skills tracking assistant. Tell me about any new skills, technologies, or courses you've been learning!",
      isBot: true,
      timestamp: new Date()
    };
    setMessages([defaultMessage]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="chatbot-floating-button">
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center group transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-300"
            aria-label="Open chat"
          >
            <svg className="w-7 h-7 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {(hasNewSkills || loading) && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-yellow-300' : 'bg-white'} animate-bounce`}></div>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transform transition-all duration-300 ease-out">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-2xl">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Skills Assistant</h3>
                <div className="flex items-center space-x-1 mt-0.5">
                  {isAuthenticated && (
                    <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                      Connected
                    </span>
                  )}
                  {loading && (
                    <span className="text-xs bg-yellow-400 bg-opacity-90 text-yellow-900 px-2 py-0.5 rounded-full animate-pulse">
                      Analyzing...
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={clearChatHistory}
                className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                aria-label="Clear chat history"
                title="Clear conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                aria-label="Close chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} chatbot-message-enter`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl text-sm shadow-sm transition-all duration-200 hover:shadow-md ${
                    message.isBot
                      ? message.isError
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : message.hasSkillUpdate
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                        : message.isAnalysisUpdate
                        ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                        : 'bg-white text-gray-800 border border-gray-200'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                  }`}
                >
                  <p>{message.text}</p>
                  {message.extractedSkills && message.extractedSkills.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Extracted skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.extractedSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {message.updatedSkillsList && message.updatedSkillsList.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Your updated skills:</p>
                      <div className="text-xs text-gray-700 max-h-20 overflow-y-auto">
                        {message.updatedSkillsList.join(', ')}
                      </div>
                    </div>
                  )}
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start chatbot-message-enter">
                <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl text-sm shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-primary-600 font-medium">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
            <div className="flex space-x-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me about your learning... (e.g., 'I learned React and SQL')"
                className="flex-1 resize-none h-10 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all duration-200 bg-gray-50 focus:bg-white"
                disabled={isLoading}
                rows="1"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                  !inputText.trim() || isLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            {!isAuthenticated && (
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <p className="flex items-center">
                  <span className="mr-1">💡</span>
                  Log in to automatically save skills to your profile
                </p>
                <p className="flex items-center">
                  <span className="mr-1">🔄</span>
                  Your career analysis will update automatically
                </p>
              </div>
            )}
            {isAuthenticated && (
              <div className="text-xs text-green-600 mt-2 flex items-center">
                <span className="mr-1">✅</span>
                Skills will be saved and your career analysis will update automatically
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;