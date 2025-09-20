import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { careerAPI } from '../services/api';

// Local storage key for conversation history
const CHAT_HISTORY_KEY = 'career_chatbot_history';

const ChatBot = () => {
  const { user, isAuthenticated, updateUserSkills, autoReanalyze } = useAppContext();
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
      
      if (isAuthenticated && user?.id) {
        // Use the new update-skills endpoint for authenticated users
        response = await careerAPI.updateSkills(user.id, inputText);
        
        // Update user context with the updated user data
        if (response.user) {
          updateUserSkills(response.user);
          
          // Check if new skills were added and trigger auto re-analysis
          if (response.extracted_skills && response.extracted_skills.length > 0) {
            setHasNewSkills(true);
            
            // Auto re-analyze with updated skills
            setTimeout(async () => {
              await autoReanalyze(response.user.skills, response.user.expertise);
            }, 1000);
          }
        }

        // Create bot response message
        const skillsText = response.extracted_skills.length > 0 
          ? `I found these skills: ${response.extracted_skills.map(s => `${s.skill} (${s.expertise_level})`).join(', ')}. I've updated your profile and refreshed your career analysis!`
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
        response = await careerAPI.updateSkillsViaChat(inputText);
        
        // Add bot response
        const botMessage = {
          id: Date.now() + 1,
          text: response.bot_message,
          isBot: true,
          timestamp: new Date(),
          extractedSkills: response.extracted_skills
        };

        setMessages(prev => [...prev, botMessage]);
      }

    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble processing your message right now. Please try again later.",
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
            className="w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
            aria-label="Open chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {hasNewSkills && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">Skills Assistant</h3>
              {isAuthenticated && (
                <span className="text-xs bg-primary-500 px-2 py-1 rounded-full">
                  Logged in
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearChatHistory}
                className="text-white hover:text-gray-200 transition-colors p-1"
                aria-label="Clear chat history"
                title="Clear conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.isBot
                      ? message.isError
                        ? 'bg-red-100 text-red-800'
                        : message.hasSkillUpdate
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-800'
                      : 'bg-primary-600 text-white'
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
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me about your learning... (e.g., 'I learned React and SQL')"
                className="flex-1 resize-none h-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                disabled={isLoading}
                rows="1"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !inputText.trim() || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
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
                Skills will be saved and analysis updated automatically
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;