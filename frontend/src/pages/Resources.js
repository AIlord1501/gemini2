import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getResources, analyzeCareer } from '../services/api';

const Resources = () => {
  const { userSkills, userExpertise } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentLimit, setCurrentLimit] = useState(5);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [allResources, setAllResources] = useState({ youtube_courses: [], articles: [] });
  const [displayedResources, setDisplayedResources] = useState({ youtube_courses: [], articles: [] });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [careerAnalysis, setCareerAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState(null);

  const topicOptions = [
    { value: 'all', label: 'All Topics', icon: '🎯' },
    { value: 'AI', label: 'Artificial Intelligence', icon: '🤖' },
    { value: 'Web Development', label: 'Web Development', icon: '🌐' },
    { value: 'Data Science', label: 'Data Science', icon: '📊' },
    { value: 'Mobile Development', label: 'Mobile Development', icon: '📱' },
    { value: 'DevOps', label: 'DevOps & Cloud', icon: '☁️' },
    { value: 'Cybersecurity', label: 'Cybersecurity', icon: '🔒' },
    { value: 'Design', label: 'UI/UX Design', icon: '🎨' },
    { value: 'Blockchain', label: 'Blockchain', icon: '⛓️' },
    { value: 'Game Development', label: 'Game Development', icon: '🎮' },
    { value: 'Machine Learning', label: 'Machine Learning', icon: '🧠' },
  ];

  const fetchCareerAnalysis = async () => {
    try {
      setAnalysisLoading(true);
      setAnalysisError(null);

      const analysis = await analyzeCareer(
        userSkills || 'General Technology',
        userExpertise || 'beginner'
      );
      
      setCareerAnalysis(analysis);
      console.log('Career analysis fetched:', analysis);
    } catch (err) {
      console.error('Error fetching career analysis:', err);
      setAnalysisError('Failed to load career analysis. Please try again.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const fetchResources = async (limit = 5, isLoadMore = false, topic = selectedTopic) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setPage(1);
        setAllResources({ youtube_courses: [], articles: [] });
        setDisplayedResources({ youtube_courses: [], articles: [] });
      }
      setError(null);

      const requestData = {
        skills: userSkills || 'General Technology',
        expertise: userExpertise || 'beginner',
        limit: limit,
        topic: topic === 'all' ? null : topic
      };

      const response = await getResources(requestData);
      
      if (isLoadMore) {
        const newAllResources = {
          youtube_courses: [...allResources.youtube_courses, ...(response.youtube_courses || [])],
          articles: [...allResources.articles, ...(response.articles || [])]
        };
        setAllResources(newAllResources);
        
        const itemsPerPage = 6;
        const newPage = page + 1;
        const startIndex = (newPage - 1) * itemsPerPage;
        
        setDisplayedResources({
          youtube_courses: newAllResources.youtube_courses.slice(0, startIndex + itemsPerPage),
          articles: newAllResources.articles.slice(0, startIndex + itemsPerPage)
        });
        
        setPage(newPage);
        
        const totalItems = newAllResources.youtube_courses.length + newAllResources.articles.length;
        const displayedItems = startIndex + itemsPerPage;
        setHasMore(totalItems > displayedItems);
      } else {
        const newResources = {
          youtube_courses: response.youtube_courses || [],
          articles: response.articles || []
        };
        setAllResources(newResources);
        
        const itemsPerPage = 6;
        setDisplayedResources({
          youtube_courses: newResources.youtube_courses.slice(0, itemsPerPage),
          articles: newResources.articles.slice(0, itemsPerPage)
        });
        
        const totalItems = newResources.youtube_courses.length + newResources.articles.length;
        setHasMore(totalItems > itemsPerPage);
      }
      
      setCurrentLimit(limit);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchCareerAnalysis();
  }, [userSkills, userExpertise]);

  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
    fetchResources(currentLimit, false, topic);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      const newLimit = currentLimit + 5;
      fetchResources(newLimit, true);
    }
  };

  const ResourceCard = ({ title, url, type }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-primary-200 transform hover:translate-y-1 hover:scale-105 group">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-3 leading-tight group-hover:text-primary-700 transition-colors duration-300">
              {title}
            </h3>
            <div className={`ml-3 px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
              type === 'youtube' 
                ? 'bg-red-100 text-red-700 group-hover:bg-red-200' 
                : 'bg-blue-100 text-blue-700 group-hover:bg-blue-200'
            } transition-colors duration-300`}>
              {type === 'youtube' ? 'Video' : 'Article'}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
              type === 'youtube'
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-200'
            } transform hover:scale-105 group-hover:shadow-2xl`}
          >
            <div className="flex items-center justify-center space-x-2">
              {type === 'youtube' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
              <span>Open</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const CareerPathCard = ({ path, isSelected = false }) => (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border ${
      isSelected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-100 hover:border-primary-200'
    } transform hover:translate-y-1 hover:scale-105`}>
      <div className="flex flex-col h-full">
        {isSelected && (
          <div className="flex items-center mb-3">
            <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
              ⭐ Recommended
            </span>
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-900 mb-3">{path.title}</h3>
        <p className="text-gray-600 mb-4 flex-1">{path.description}</p>
        
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-700">💰 Salary Range:</span>
            <p className="text-primary-600 font-semibold">{path.salary_range}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-700">📈 Growth Prospect:</span>
            <p className="text-gray-600">{path.growth_prospect}</p>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-700">🛠️ Required Skills:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {path.required_skills?.map((skill, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading || analysisLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-10 bg-gray-200 rounded mx-auto w-80 mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded mx-auto w-96 animate-pulse"></div>
          </div>
          <div className="space-y-12">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || analysisError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
              <p className="text-red-600 mb-4">{error || analysisError}</p>
              <button
                onClick={() => {
                  if (error) fetchResources();
                  if (analysisError) fetchCareerAnalysis();
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasResources = displayedResources?.youtube_courses?.length > 0 || displayedResources?.articles?.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Career Analysis & Learning Resources
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete career guidance and learning materials for: <span className="font-semibold text-primary-600">{userSkills || 'General Technology'}</span> at <span className="font-semibold text-primary-600">{userExpertise || 'beginner'}</span> level
          </p>
        </div>

        {/* Topic Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-lg font-semibold text-gray-700">Filter by Topic:</span>
              <select
                value={selectedTopic}
                onChange={(e) => handleTopicChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-300 min-w-[200px]"
              >
                {topicOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Career Analysis Section */}
        {careerAnalysis && (
          <div className="space-y-12 mb-16">
            {/* Recommended Career Path */}
            {careerAnalysis.selected_path && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Recommended Career Path</h2>
                <div className="grid grid-cols-1 gap-6">
                  <CareerPathCard path={careerAnalysis.selected_path} isSelected={true} />
                </div>
              </section>
            )}

            {/* All Career Paths */}
            {careerAnalysis.career_paths && careerAnalysis.career_paths.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 All Career Paths ({careerAnalysis.career_paths.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {careerAnalysis.career_paths.map((path, index) => (
                    <CareerPathCard 
                      key={`path-${index}`} 
                      path={path} 
                      isSelected={path.title === careerAnalysis.selected_path?.title}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Career Roadmap */}
            {careerAnalysis.roadmap && careerAnalysis.roadmap.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🗺️ Career Roadmap ({careerAnalysis.roadmap.length} steps)</h2>
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                  <div className="space-y-6">
                    {careerAnalysis.roadmap.map((step, index) => (
                      <div key={`step-${index}`} className="flex items-start space-x-4">
                        <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                          <p className="text-gray-600 mb-2">{step.description}</p>
                          <span className="text-sm text-primary-600 font-medium">⏱️ {step.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Recommended Courses */}
            {careerAnalysis.courses && careerAnalysis.courses.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📖 Recommended Courses ({careerAnalysis.courses.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {careerAnalysis.courses.map((course, index) => (
                    <div key={`course-${index}`} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h4>
                      <div className="space-y-2 mb-4">
                        <div className="text-sm text-gray-600">🏢 {course.provider}</div>
                        <div className="text-sm text-gray-600">⏱️ {course.duration}</div>
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            course.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                            course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {course.difficulty}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(course.url, '_blank', 'noopener,noreferrer')}
                        className="w-full py-2 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-300"
                      >
                        View Course
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Learning Resources Section */}
        {hasResources && (
          <div className="border-t border-gray-200 pt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">📚 Additional Learning Resources</h2>
            
            <div className="space-y-12">
              {/* YouTube Courses */}
              {displayedResources?.youtube_courses && displayedResources.youtube_courses.length > 0 && (
                <section>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">YouTube Courses ({displayedResources.youtube_courses.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedResources.youtube_courses.map((course, index) => (
                      <ResourceCard
                        key={`youtube-${index}`}
                        title={course.title}
                        url={course.url}
                        type="youtube"
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Articles */}
              {displayedResources?.articles && displayedResources.articles.length > 0 && (
                <section>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Articles & Guides ({displayedResources.articles.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedResources.articles.map((article, index) => (
                      <ResourceCard
                        key={`article-${index}`}
                        title={article.title}
                        url={article.url}
                        type="article"
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-300 disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading More...' : 'Load More Resources'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasResources && !careerAnalysis && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-600 mb-6">Please update your skills to get personalized recommendations.</p>
            <button
              onClick={() => {
                fetchResources();
                fetchCareerAnalysis();
              }}
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-300"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;