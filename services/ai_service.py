import json
import os
import requests
from typing import Dict, Any, List
from datetime import datetime
try:
    from google.cloud import aiplatform
    from google.cloud import firestore
    from vertexai.generative_models import GenerativeModel
    VERTEX_AI_AVAILABLE = True
except ImportError:
    print("Warning: Vertex AI not available. Using fallback AI services.")
    VERTEX_AI_AVAILABLE = False

from models.schemas import CareerPath, Course, RoadmapStep, MockTestQuestion

class AIService:
    """Service for handling AI-related operations with multiple AI provider fallbacks"""
    
    def __init__(self):
        """Initialize the AI service with Vertex AI as primary and fallbacks"""
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "your-project-id")
        self.vertex_ai_available = VERTEX_AI_AVAILABLE
        self.model = None
        self.firestore_client = None
        
        # Initialize Vertex AI if available
        if self.vertex_ai_available:
            try:
                aiplatform.init(project=self.project_id)
                self.model = GenerativeModel("gemini-1.0-pro")
                print("✅ Vertex AI initialized successfully")
            except Exception as e:
                print(f"Warning: Could not initialize Vertex AI: {e}")
                self.vertex_ai_available = False
        
        # Initialize Firestore client with error handling
        if self.vertex_ai_available:
            try:
                self.firestore_client = firestore.Client(project=self.project_id)
            except Exception as e:
                print(f"Warning: Could not initialize Firestore client: {e}")
                self.firestore_client = None
        
        # Initialize fallback AI services
        self.fallback_apis = {
            'huggingface': self._init_huggingface(),
            'ollama': self._init_ollama(),
            'openai_free': self._init_openai_free()
        }
        
        print(f"🤖 AI Service initialized. Vertex AI: {'✅' if self.vertex_ai_available else '❌'}")
        if not self.vertex_ai_available:
            available_fallbacks = [name for name, available in self.fallback_apis.items() if available]
            print(f"📡 Available fallback AI services: {available_fallbacks if available_fallbacks else 'None - using static responses'}")
    
    def _init_huggingface(self) -> bool:
        """Initialize Hugging Face API (free tier available)"""
        try:
            # Hugging Face provides free API access
            self.hf_api_url = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large"
            # You can also use: facebook/blenderbot-400M-distill, microsoft/DialoGPT-medium
            self.hf_headers = {
                "Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY', '')}",
                "Content-Type": "application/json"
            }
            return True
        except Exception as e:
            print(f"Warning: Could not initialize Hugging Face API: {e}")
            return False
    
    def _init_ollama(self) -> bool:
        """Initialize Ollama (local AI models - completely free)"""
        try:
            # Check if Ollama is running locally
            response = requests.get("http://localhost:11434/api/tags", timeout=2)
            if response.status_code == 200:
                self.ollama_url = "http://localhost:11434/api/generate"
                print("✅ Ollama detected locally")
                return True
        except:
            pass
        return False
    
    def _init_openai_free(self) -> bool:
        """Initialize OpenAI-compatible free APIs"""
        try:
            # Free OpenAI-compatible APIs like Together AI, Groq, etc.
            self.openai_free_url = os.getenv('OPENAI_FREE_API_URL', '')
            self.openai_free_key = os.getenv('OPENAI_FREE_API_KEY', '')
            return bool(self.openai_free_url and self.openai_free_key)
        except:
            return False
    
    def _generate_with_fallback_ai(self, prompt: str) -> str:
        """Try different AI services as fallbacks"""
        
        # Try Ollama first (local, completely free)
        if self.fallback_apis['ollama']:
            try:
                response = requests.post(
                    self.ollama_url,
                    json={
                        "model": "llama2",  # or "mistral", "codellama", etc.
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=30
                )
                if response.status_code == 200:
                    result = response.json()
                    if 'response' in result:
                        print("✅ Generated content using Ollama (local AI)")
                        return result['response']
            except Exception as e:
                print(f"Ollama request failed: {e}")
        
        # Try Hugging Face API
        if self.fallback_apis['huggingface']:
            try:
                # Use a better model for generation
                hf_generation_url = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large"
                response = requests.post(
                    hf_generation_url,
                    headers=self.hf_headers,
                    json={
                        "inputs": prompt,
                        "parameters": {
                            "max_length": 1000,
                            "temperature": 0.7,
                            "do_sample": True
                        }
                    },
                    timeout=30
                )
                if response.status_code == 200:
                    result = response.json()
                    if isinstance(result, list) and len(result) > 0:
                        print("✅ Generated content using Hugging Face API")
                        return result[0].get('generated_text', '')
            except Exception as e:
                print(f"Hugging Face request failed: {e}")
        
        # Try OpenAI-compatible free API
        if self.fallback_apis['openai_free']:
            try:
                response = requests.post(
                    f"{self.openai_free_url}/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openai_free_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-3.5-turbo",  # or whatever model the service provides
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 1000,
                        "temperature": 0.7
                    },
                    timeout=30
                )
                if response.status_code == 200:
                    result = response.json()
                    if 'choices' in result and len(result['choices']) > 0:
                        print("✅ Generated content using OpenAI-compatible API")
                        return result['choices'][0]['message']['content']
            except Exception as e:
                print(f"OpenAI-compatible API request failed: {e}")
        
        # If all APIs fail, return None to trigger static fallback
        print("⚠️ All AI services unavailable, using static fallback")
        return None
    def generate_career_analysis(self, skills: str, expertise: str, topic: str = None) -> Dict[str, Any]:
        """Generate career analysis using available AI services with fallbacks"""
        
        prompt = f"""
        Based on the following skills and expertise, provide a comprehensive career analysis:

        Skills: {skills}
        Expertise: {expertise}

        Please provide a JSON response with the following structure:
        {{
            "career_paths": [
                {{
                    "title": "Career Path Title",
                    "description": "Brief description of the career path",
                    "required_skills": ["skill1", "skill2", "skill3"],
                    "salary_range": "e.g., $60,000 - $120,000",
                    "growth_prospect": "High/Medium/Low with brief explanation"
                }}
            ],
            "selected_path": {{
                "title": "Best matching career path",
                "description": "Detailed description",
                "required_skills": ["skill1", "skill2", "skill3"],
                "salary_range": "e.g., $60,000 - $120,000",
                "growth_prospect": "High/Medium/Low with brief explanation"
            }},
            "roadmap": [
                {{
                    "step": 1,
                    "title": "Step title",
                    "description": "What to do in this step",
                    "duration": "e.g., 3-6 months",
                    "resources": ["resource1", "resource2"]
                }}
            ],
            "courses": [
                {{
                    "title": "Course title",
                    "provider": "Course provider",
                    "duration": "e.g., 8 weeks",
                    "difficulty": "Beginner/Intermediate/Advanced",
                    "url": "Course URL or platform"
                }}
            ]
        }}

        Provide exactly 3 career paths, select the best one, create a 5-step roadmap, and suggest 3-5 relevant courses.
        Focus on practical, actionable advice.
        """

        # Try Vertex AI first if available
        if self.vertex_ai_available and self.model:
            try:
                response = self.model.generate_content(prompt)
                response_text = response.text
                
                # Extract JSON from response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_str = response_text[start_idx:end_idx]
                    result = json.loads(json_str)
                    print("✅ Generated career analysis using Vertex AI")
                    return result
                    
            except Exception as e:
                print(f"Vertex AI generation failed: {e}")
        
        # Try fallback AI services
        ai_response = self._generate_with_fallback_ai(prompt)
        if ai_response:
            try:
                # Try to extract JSON from AI response
                start_idx = ai_response.find('{')
                end_idx = ai_response.rfind('}') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_str = ai_response[start_idx:end_idx]
                    result = json.loads(json_str)
                    return result
            except Exception as e:
                print(f"Error parsing AI response: {e}")
        
        # Fallback to static response
        print("📊 Using enhanced static career analysis")
        return self._create_enhanced_fallback_response(skills, expertise, topic)
    
    def _create_enhanced_fallback_response(self, skills: str, expertise: str, topic: str = None) -> Dict[str, Any]:
        """Create an enhanced fallback response that adapts to user's skills and topic"""
        
        skills_lower = skills.lower()
        topic_lower = topic.lower() if topic else ""
        
        # Determine primary domain based on topic first, then skills
        primary_domain = None
        
        # If topic is specified, use it to determine domain
        if topic and topic.lower() != 'all':
            if topic_lower in ['ai', 'artificial intelligence', 'machine learning']:
                primary_domain = 'ai_ml'
            elif topic_lower in ['web development', 'web dev', 'frontend', 'backend']:
                primary_domain = 'web_development'
            elif topic_lower in ['data science', 'data analysis', 'analytics']:
                primary_domain = 'data_science'
            elif topic_lower in ['mobile development', 'mobile', 'app development']:
                primary_domain = 'mobile_development'
            elif topic_lower in ['devops', 'cloud', 'aws', 'docker']:
                primary_domain = 'devops'
            elif topic_lower in ['cybersecurity', 'security', 'infosec']:
                primary_domain = 'cybersecurity'
            elif topic_lower in ['design', 'ui/ux design', 'ui', 'ux']:
                primary_domain = 'design'
            elif topic_lower in ['blockchain', 'crypto', 'web3']:
                primary_domain = 'blockchain'
            elif topic_lower in ['game development', 'gamedev', 'gaming']:
                primary_domain = 'game_development'
        
        # If no topic specified or topic not recognized, determine from skills
        if not primary_domain:
            if any(skill in skills_lower for skill in ['python', 'javascript', 'java', 'programming', 'coding', 'react', 'node']):
                primary_domain = 'software_development'
            elif any(skill in skills_lower for skill in ['data', 'analytics', 'sql', 'pandas', 'statistics', 'machine learning']):
                primary_domain = 'data_science'
            elif any(skill in skills_lower for skill in ['design', 'ui', 'ux', 'photoshop', 'figma', 'adobe']):
                primary_domain = 'design'
            elif any(skill in skills_lower for skill in ['marketing', 'social media', 'seo', 'content', 'advertising']):
                primary_domain = 'marketing'
            elif any(skill in skills_lower for skill in ['project management', 'agile', 'scrum', 'leadership']):
                primary_domain = 'project_management'
            else:
                primary_domain = 'general_tech'
        
        # Get domain-specific career paths
        if any(skill in skills_lower for skill in ['python', 'javascript', 'java', 'programming', 'coding', 'react', 'node']):
            primary_domain = 'software_development'
        elif any(skill in skills_lower for skill in ['data', 'analytics', 'sql', 'pandas', 'statistics', 'machine learning']):
            primary_domain = 'data_science'
        elif any(skill in skills_lower for skill in ['design', 'ui', 'ux', 'photoshop', 'figma', 'adobe']):
            primary_domain = 'design'
        elif any(skill in skills_lower for skill in ['marketing', 'social media', 'seo', 'content', 'advertising']):
            primary_domain = 'marketing'
        elif any(skill in skills_lower for skill in ['project management', 'agile', 'scrum', 'leadership']):
            primary_domain = 'project_management'
        else:
            primary_domain = 'general_tech'
        
        return self._create_career_analysis_for_domain(primary_domain, skills, expertise)
    
    def _create_career_analysis_for_domain(self, domain: str, skills: str, expertise: str) -> Dict[str, Any]:
        """Create career analysis based on domain"""
        
        if domain == 'software_development':
            return {
                "career_paths": [
                    {
                        "title": "Software Engineer",
                        "description": "Design and develop software applications, systems, and solutions.",
                        "required_skills": ["Programming Languages", "Problem Solving", "Software Architecture", "Testing"],
                        "salary_range": "$70,000 - $150,000",
                        "growth_prospect": "High - Software engineering continues to be in high demand across all industries."
                    },
                    {
                        "title": "Full Stack Developer",
                        "description": "Work on both frontend and backend development of web applications.",
                        "required_skills": ["JavaScript", "React/Vue", "Node.js", "Databases", "APIs"],
                        "salary_range": "$65,000 - $130,000",
                        "growth_prospect": "High - Full stack developers are versatile and highly sought after."
                    },
                    {
                        "title": "DevOps Engineer",
                        "description": "Bridge development and operations, focusing on automation and deployment.",
                        "required_skills": ["Cloud Platforms", "CI/CD", "Docker", "Kubernetes", "Infrastructure as Code"],
                        "salary_range": "$80,000 - $160,000",
                        "growth_prospect": "Very High - DevOps practices are essential for modern software delivery."
                    }
                ],
                "selected_path": {
                    "title": "Software Engineer",
                    "description": "Based on your programming skills, software engineering offers the best growth opportunities and aligns with current market demand.",
                    "required_skills": ["Programming Languages", "Problem Solving", "Software Architecture", "Testing"],
                    "salary_range": "$70,000 - $150,000",
                    "growth_prospect": "High - Software engineering continues to be in high demand across all industries."
                },
                "roadmap": [
                    {
                        "step": 1,
                        "title": "Master Programming Fundamentals",
                        "description": "Strengthen your foundation in programming languages, data structures, and algorithms.",
                        "duration": "2-3 months",
                        "resources": ["LeetCode", "HackerRank", "Coursera algorithms courses"]
                    },
                    {
                        "step": 2,
                        "title": "Build Projects",
                        "description": "Create 3-5 substantial projects demonstrating different skills and technologies.",
                        "duration": "3-4 months",
                        "resources": ["GitHub", "Personal portfolio website", "Open source contributions"]
                    },
                    {
                        "step": 3,
                        "title": "Learn System Design",
                        "description": "Understand how to design scalable systems and software architecture.",
                        "duration": "2-3 months",
                        "resources": ["System Design Primer", "High Scalability blog", "AWS Architecture Center"]
                    },
                    {
                        "step": 4,
                        "title": "Practice Technical Interviews",
                        "description": "Prepare for coding interviews and technical discussions.",
                        "duration": "1-2 months",
                        "resources": ["Cracking the Coding Interview", "Mock interviews", "Interview practice platforms"]
                    },
                    {
                        "step": 5,
                        "title": "Apply and Network",
                        "description": "Start applying to positions and building professional networks.",
                        "duration": "Ongoing",
                        "resources": ["LinkedIn", "Tech meetups", "Job boards", "Company career pages"]
                    }
                ],
                "courses": [
                    {
                        "title": "Complete Web Development Bootcamp",
                        "provider": "Udemy",
                        "duration": "65 hours",
                        "difficulty": "Beginner",
                        "url": "https://www.udemy.com/course/the-complete-web-development-bootcamp/"
                    },
                    {
                        "title": "Algorithms Specialization",
                        "provider": "Coursera (Stanford)",
                        "duration": "4 months",
                        "difficulty": "Intermediate",
                        "url": "https://www.coursera.org/specializations/algorithms"
                    },
                    {
                        "title": "System Design Interview",
                        "provider": "Educative",
                        "duration": "3-4 weeks",
                        "difficulty": "Advanced",
                        "url": "https://www.educative.io/courses/grokking-the-system-design-interview"
                    }
                ]
            }
        
        elif domain == 'data_science':
            return {
                "career_paths": [
                    {
                        "title": "Data Scientist",
                        "description": "Analyze complex data to drive business decisions and insights.",
                        "required_skills": ["Python/R", "Statistics", "Machine Learning", "Data Visualization"],
                        "salary_range": "$80,000 - $160,000",
                        "growth_prospect": "Very High - Data science is one of the fastest growing fields."
                    },
                    {
                        "title": "Data Analyst",
                        "description": "Collect, process, and analyze data to support business decisions.",
                        "required_skills": ["SQL", "Excel", "Tableau/PowerBI", "Statistics"],
                        "salary_range": "$55,000 - $95,000",
                        "growth_prospect": "High - Every organization needs data analysts."
                    },
                    {
                        "title": "Machine Learning Engineer",
                        "description": "Design and implement ML systems and algorithms in production.",
                        "required_skills": ["Python", "TensorFlow/PyTorch", "MLOps", "Cloud Platforms"],
                        "salary_range": "$90,000 - $180,000",
                        "growth_prospect": "Very High - AI/ML adoption is accelerating across industries."
                    }
                ],
                "selected_path": {
                    "title": "Data Scientist",
                    "description": "Perfect blend of statistics, programming, and business acumen to extract insights from data.",
                    "required_skills": ["Python/R", "Statistics", "Machine Learning", "Data Visualization"],
                    "salary_range": "$80,000 - $160,000",
                    "growth_prospect": "Very High - Data science is one of the fastest growing fields."
                },
                "roadmap": [
                    {
                        "step": 1,
                        "title": "Master Python for Data Science",
                        "description": "Learn Python, pandas, numpy, and data manipulation techniques.",
                        "duration": "2-3 months",
                        "resources": ["Python for Data Analysis book", "Kaggle Learn", "DataCamp"]
                    },
                    {
                        "step": 2,
                        "title": "Learn Statistics and Math",
                        "description": "Build strong foundation in statistics, probability, and linear algebra.",
                        "duration": "2-3 months",
                        "resources": ["Khan Academy", "Coursera Statistics courses", "Think Stats book"]
                    },
                    {
                        "step": 3,
                        "title": "Machine Learning Fundamentals",
                        "description": "Understand supervised and unsupervised learning algorithms.",
                        "duration": "3-4 months",
                        "resources": ["Scikit-learn documentation", "Andrew Ng's ML Course", "Hands-On ML book"]
                    },
                    {
                        "step": 4,
                        "title": "Data Visualization and Communication",
                        "description": "Learn to create compelling visualizations and communicate findings.",
                        "duration": "1-2 months",
                        "resources": ["Matplotlib/Seaborn", "Tableau", "Storytelling with Data book"]
                    },
                    {
                        "step": 5,
                        "title": "Build Portfolio Projects",
                        "description": "Complete end-to-end data science projects for your portfolio.",
                        "duration": "3-4 months",
                        "resources": ["Kaggle competitions", "GitHub", "Personal blog", "Public datasets"]
                    }
                ],
                "courses": [
                    {
                        "title": "Machine Learning Course",
                        "provider": "Coursera (Stanford)",
                        "duration": "11 weeks",
                        "difficulty": "Intermediate",
                        "url": "https://www.coursera.org/learn/machine-learning"
                    },
                    {
                        "title": "Python for Data Science and AI",
                        "provider": "IBM (Coursera)",
                        "duration": "5 weeks",
                        "difficulty": "Beginner",
                        "url": "https://www.coursera.org/learn/python-for-applied-data-science-ai"
                    },
                    {
                        "title": "Advanced Data Science Specialization",
                        "provider": "Johns Hopkins (Coursera)",
                        "duration": "4 months",
                        "difficulty": "Advanced",
                        "url": "https://www.coursera.org/specializations/advanced-data-science-ibm"
                    }
                ]
            }
        
        # Default fallback for other domains
        return {
            "career_paths": [
                {
                    "title": "Technology Professional",
                    "description": "Leverage technology skills to solve problems and drive innovation.",
                    "required_skills": ["Technical Skills", "Problem Solving", "Communication", "Continuous Learning"],
                    "salary_range": "$50,000 - $120,000",
                    "growth_prospect": "High - Technology skills are increasingly valuable across all industries."
                },
                {
                    "title": "Digital Specialist",
                    "description": "Apply digital tools and technologies to improve business processes.",
                    "required_skills": ["Digital Literacy", "Process Improvement", "Data Analysis", "Project Management"],
                    "salary_range": "$45,000 - $90,000",
                    "growth_prospect": "High - Digital transformation is a priority for most organizations."
                },
                {
                    "title": "Technical Consultant",
                    "description": "Provide expert advice and solutions for technology challenges.",
                    "required_skills": ["Domain Expertise", "Communication", "Problem Solving", "Client Management"],
                    "salary_range": "$60,000 - $140,000",
                    "growth_prospect": "High - Organizations need specialized expertise for technology adoption."
                }
            ],
            "selected_path": {
                "title": "Technology Professional",
                "description": "A versatile role that allows you to grow your technical skills while contributing to meaningful projects.",
                "required_skills": ["Technical Skills", "Problem Solving", "Communication", "Continuous Learning"],
                "salary_range": "$50,000 - $120,000",
                "growth_prospect": "High - Technology skills are increasingly valuable across all industries."
            },
            "roadmap": [
                {
                    "step": 1,
                    "title": "Strengthen Core Skills",
                    "description": "Focus on building strong technical foundations in your area of interest.",
                    "duration": "2-3 months",
                    "resources": ["Online courses", "Practice projects", "Documentation"]
                },
                {
                    "step": 2,
                    "title": "Gain Practical Experience",
                    "description": "Apply your skills through projects, internships, or volunteer work.",
                    "duration": "3-6 months",
                    "resources": ["GitHub projects", "Freelance platforms", "Open source contributions"]
                },
                {
                    "step": 3,
                    "title": "Build Professional Network",
                    "description": "Connect with professionals in your field and learn from their experiences.",
                    "duration": "Ongoing",
                    "resources": ["LinkedIn", "Professional meetups", "Industry conferences"]
                },
                {
                    "step": 4,
                    "title": "Develop Specialization",
                    "description": "Choose a specific area to specialize in and become an expert.",
                    "duration": "6-12 months",
                    "resources": ["Advanced courses", "Certifications", "Industry publications"]
                },
                {
                    "step": 5,
                    "title": "Seek Growth Opportunities",
                    "description": "Look for positions that challenge you and offer career advancement.",
                    "duration": "Ongoing",
                    "resources": ["Job boards", "Career fairs", "Professional referrals"]
                }
            ],
            "courses": [
                {
                    "title": "Technology Fundamentals",
                    "provider": "Coursera",
                    "duration": "4-6 weeks",
                    "difficulty": "Beginner",
                    "url": "https://www.coursera.org/courses?query=technology%20fundamentals"
                },
                {
                    "title": "Project Management Professional",
                    "provider": "PMI",
                    "duration": "3-6 months",
                    "difficulty": "Intermediate",
                    "url": "https://www.pmi.org/certifications/project-management-pmp"
                },
                {
                    "title": "Digital Transformation",
                    "provider": "MIT xPRO",
                    "duration": "8 weeks",
                    "difficulty": "Advanced",
                    "url": "https://xpro.mit.edu/courses/course-v1:xPRO+DTx+2024"
                }
            ]
        }

    def generate_mock_test(self, skills: str, expertise: str, topic: str = None, user_id: str = None) -> Dict[str, Any]:
        """Generate a mock test using available AI services with fallbacks"""
        
        # Build the prompt
        topic_text = f" focusing on {topic}" if topic else ""
        prompt = f"""
        Generate a 5-question mock test for a user with skills {skills} and expertise {expertise}{topic_text}.
        Include questions and answers in JSON format:
        [
          {{"question": "...", "answer": "..."}},
          {{"question": "...", "answer": "..."}},
          {{"question": "...", "answer": "..."}},
          {{"question": "...", "answer": "..."}},
          {{"question": "...", "answer": "..."}}
        ]
        
        Make the questions challenging but appropriate for the specified skill level.
        Provide detailed answers that explain the concepts.
        """

        questions = None
        
        # Try Vertex AI first if available
        if self.vertex_ai_available and self.model:
            try:
                response = self.model.generate_content(prompt)
                response_text = response.text
                
                # Try to find JSON in the response
                start_idx = response_text.find('[')
                end_idx = response_text.rfind(']') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_str = response_text[start_idx:end_idx]
                    questions_data = json.loads(json_str)
                    
                    # Convert to MockTestQuestion objects
                    questions = [MockTestQuestion(**q) for q in questions_data]
                    print("✅ Generated mock test using Vertex AI")
                    
            except Exception as e:
                print(f"Vertex AI mock test generation failed: {e}")
        
        # Try fallback AI services if Vertex AI failed
        if not questions:
            ai_response = self._generate_with_fallback_ai(prompt)
            if ai_response:
                try:
                    # Try to extract JSON from AI response
                    start_idx = ai_response.find('[')
                    end_idx = ai_response.rfind(']') + 1
                    
                    if start_idx != -1 and end_idx != -1:
                        json_str = ai_response[start_idx:end_idx]
                        questions_data = json.loads(json_str)
                        questions = [MockTestQuestion(**q) for q in questions_data]
                except Exception as e:
                    print(f"Error parsing AI mock test response: {e}")
        
        # Fallback to static questions if all AI services failed
        if not questions:
            print("📝 Using enhanced static mock test")
            questions = self._create_enhanced_fallback_test(skills, expertise, topic)
        
        # Generate test ID
        test_id = f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(skills + expertise) % 10000}"
        
        # Save to Firestore
        test_data = {
            "test_id": test_id,
            "skills": skills,
            "expertise": expertise,
            "topic": topic,
            "user_id": user_id,
            "questions": [q.dict() for q in questions],
            "created_at": datetime.now().isoformat(),
            "timestamp": firestore.SERVER_TIMESTAMP
        }
        
        try:
            # Save to Firestore if client is available
            if self.firestore_client:
                doc_ref = self.firestore_client.collection('mock_tests').document(test_id)
                doc_ref.set(test_data)
                print(f"Mock test saved to Firestore with ID: {test_id}")
            else:
                print(f"Warning: Firestore not available. Mock test not saved: {test_id}")
        except Exception as e:
            print(f"Error saving to Firestore: {e}")
        
        return {
            "test_id": test_id,
            "questions": [q.dict() for q in questions],
            "user_id": user_id,
            "created_at": test_data["created_at"]
        }
    
    def _create_enhanced_fallback_test(self, skills: str, expertise: str, topic: str = None) -> List[MockTestQuestion]:
        """Create enhanced fallback mock test questions based on user skills and topic"""
        
        skills_lower = skills.lower()
        topic_lower = topic.lower() if topic else ""
        
        # Determine question type based on skills and topic
        if any(skill in skills_lower for skill in ['python', 'programming']) or 'python' in topic_lower:
            return self._create_python_test_questions(expertise)
        elif any(skill in skills_lower for skill in ['javascript', 'js', 'react', 'frontend']) or 'javascript' in topic_lower:
            return self._create_javascript_test_questions(expertise)
        elif any(skill in skills_lower for skill in ['data', 'analytics', 'sql', 'database']) or 'data' in topic_lower:
            return self._create_data_science_test_questions(expertise)
        elif any(skill in skills_lower for skill in ['design', 'ui', 'ux']) or 'design' in topic_lower:
            return self._create_design_test_questions(expertise)
        else:
            return self._create_general_tech_test_questions(expertise)
    
    def _create_python_test_questions(self, expertise: str) -> List[MockTestQuestion]:
        """Create Python-specific test questions"""
        if expertise.lower() in ['advanced', 'expert']:
            return [
                MockTestQuestion(
                    question="What is the difference between __str__ and __repr__ methods in Python classes?",
                    answer="__str__ is meant to be readable and is called by str() and print(). __repr__ is meant to be unambiguous and is called by repr(). __repr__ should ideally return a string that could recreate the object."
                ),
                MockTestQuestion(
                    question="Explain Python's Global Interpreter Lock (GIL) and its impact on multithreading.",
                    answer="The GIL prevents multiple native threads from executing Python bytecodes simultaneously. This means CPU-bound programs won't benefit from multithreading, but I/O-bound programs can still benefit. Use multiprocessing for CPU-bound tasks."
                ),
                MockTestQuestion(
                    question="What are Python decorators and how do they work internally?",
                    answer="Decorators are functions that modify other functions. They use closure to wrap the original function. @decorator is syntactic sugar for func = decorator(func). They're useful for logging, authentication, caching, etc."
                ),
                MockTestQuestion(
                    question="Explain the difference between deep copy and shallow copy in Python.",
                    answer="Shallow copy creates a new object but inserts references to objects in the original. Deep copy creates new objects recursively. Use copy.copy() for shallow and copy.deepcopy() for deep copying."
                ),
                MockTestQuestion(
                    question="How does Python's memory management work?",
                    answer="Python uses reference counting plus cycle detection for garbage collection. Objects are deleted when reference count reaches zero. Cycle detector handles circular references that reference counting can't resolve."
                )
            ]
        else:
            return [
                MockTestQuestion(
                    question="What is the difference between a list and a tuple in Python?",
                    answer="Lists are mutable (can be changed) and use square brackets []. Tuples are immutable (cannot be changed) and use parentheses (). Lists are better for data that changes, tuples for fixed data."
                ),
                MockTestQuestion(
                    question="How do you handle exceptions in Python?",
                    answer="Use try-except blocks. Put risky code in 'try', handle errors in 'except'. You can catch specific exceptions or use 'except Exception' for general errors. Always include meaningful error messages."
                ),
                MockTestQuestion(
                    question="What is a Python function and how do you define one?",
                    answer="A function is a reusable block of code. Define with 'def function_name(parameters):' followed by indented code. Functions can return values using 'return' and accept parameters to work with different data."
                ),
                MockTestQuestion(
                    question="Explain Python dictionaries and their use cases.",
                    answer="Dictionaries store key-value pairs using curly braces {}. Keys must be unique and immutable. They're perfect for mapping relationships, caching, and when you need fast lookups by key."
                ),
                MockTestQuestion(
                    question="What are Python loops and when would you use each type?",
                    answer="'for' loops iterate over sequences (lists, strings, ranges). 'while' loops continue until a condition is false. Use 'for' when you know the iterations, 'while' for conditional repetition."
                )
            ]
    
    def _create_javascript_test_questions(self, expertise: str) -> List[MockTestQuestion]:
        """Create JavaScript-specific test questions"""
        if expertise.lower() in ['advanced', 'expert']:
            return [
                MockTestQuestion(
                    question="Explain JavaScript's event loop and how asynchronous operations work.",
                    answer="The event loop handles async operations by moving callbacks to a queue when async operations complete. It continuously checks if the call stack is empty, then processes queued callbacks. This enables non-blocking I/O."
                ),
                MockTestQuestion(
                    question="What is closure in JavaScript and provide a practical example.",
                    answer="Closure is when an inner function has access to outer function's variables even after the outer function returns. Example: function outer(x) { return function(y) { return x + y; }; } - the inner function 'closes over' x."
                ),
                MockTestQuestion(
                    question="Explain the difference between 'this' in regular functions vs arrow functions.",
                    answer="Regular functions have dynamic 'this' based on how they're called. Arrow functions inherit 'this' from enclosing scope (lexical this). Arrow functions can't be used as constructors and don't have their own 'this'."
                ),
                MockTestQuestion(
                    question="What are JavaScript Promises and how do they handle async operations?",
                    answer="Promises represent eventual completion of async operations. They have three states: pending, fulfilled, rejected. Use .then() for success, .catch() for errors, .finally() for cleanup. Better than callbacks for avoiding callback hell."
                ),
                MockTestQuestion(
                    question="Explain prototype inheritance in JavaScript.",
                    answer="Every object has a prototype chain. When accessing a property, JS looks up the chain until found. Objects inherit from Object.prototype by default. Use Object.create() or class syntax for inheritance."
                )
            ]
        else:
            return [
                MockTestQuestion(
                    question="What is the difference between 'let', 'const', and 'var' in JavaScript?",
                    answer="'var' is function-scoped and hoisted. 'let' and 'const' are block-scoped. 'const' cannot be reassigned after declaration. Use 'const' by default, 'let' when you need to reassign, avoid 'var'."
                ),
                MockTestQuestion(
                    question="How do you create and manipulate arrays in JavaScript?",
                    answer="Create arrays with [] or new Array(). Common methods: push() adds to end, pop() removes from end, shift()/unshift() for beginning, slice() for copying portions, splice() for adding/removing elements."
                ),
                MockTestQuestion(
                    question="What are JavaScript functions and different ways to declare them?",
                    answer="Functions are reusable code blocks. Declare with: function name() {}, const name = function() {}, const name = () => {}. Arrow functions are shorter and don't have their own 'this'."
                ),
                MockTestQuestion(
                    question="How do you work with objects in JavaScript?",
                    answer="Objects store key-value pairs. Create with {} or new Object(). Access properties with dot notation (obj.key) or brackets (obj['key']). Add/modify properties by assignment."
                ),
                MockTestQuestion(
                    question="What is DOM manipulation and how do you select elements?",
                    answer="DOM manipulation changes HTML elements with JavaScript. Select elements using document.getElementById(), querySelector(), getElementsByClassName(). Modify with innerHTML, textContent, style properties."
                )
            ]
    
    def _create_data_science_test_questions(self, expertise: str) -> List[MockTestQuestion]:
        """Create data science-specific test questions"""
        return [
            MockTestQuestion(
                question="What is the difference between supervised and unsupervised learning?",
                answer="Supervised learning uses labeled data to train models for prediction (classification/regression). Unsupervised learning finds patterns in unlabeled data (clustering, dimensionality reduction)."
            ),
            MockTestQuestion(
                question="Explain what SQL JOINs are and when to use different types.",
                answer="JOINs combine data from multiple tables. INNER JOIN returns matching records. LEFT JOIN returns all left table records plus matches. RIGHT JOIN returns all right table records plus matches. FULL JOIN returns all records."
            ),
            MockTestQuestion(
                question="What is data normalization and why is it important?",
                answer="Data normalization scales features to similar ranges (0-1 or standard normal). It's important because algorithms like neural networks and k-means are sensitive to feature scales, and it improves convergence and performance."
            ),
            MockTestQuestion(
                question="Explain the bias-variance tradeoff in machine learning.",
                answer="Bias is error from oversimplifying assumptions. Variance is error from model sensitivity to training data. High bias = underfitting, high variance = overfitting. Goal is finding optimal balance for best generalization."
            ),
            MockTestQuestion(
                question="What are some common data visualization best practices?",
                answer="Choose appropriate chart types for data. Use clear labels and titles. Avoid 3D charts and pie charts with many categories. Ensure accessibility with colorblind-friendly palettes. Start y-axis at zero for bar charts."
            )
        ]
    
    def _create_design_test_questions(self, expertise: str) -> List[MockTestQuestion]:
        """Create design-specific test questions"""
        return [
            MockTestQuestion(
                question="What are the key principles of good user interface design?",
                answer="Key principles include: consistency, clarity, efficiency, forgiveness (easy to undo), accessibility, user control, and feedback. Focus on user needs, maintain visual hierarchy, and reduce cognitive load."
            ),
            MockTestQuestion(
                question="Explain the difference between UX and UI design.",
                answer="UX (User Experience) focuses on overall user journey, research, and problem-solving. UI (User Interface) focuses on visual design, layouts, and interactions. UX is strategy, UI is implementation."
            ),
            MockTestQuestion(
                question="What is color theory and how does it apply to digital design?",
                answer="Color theory studies how colors interact. Use complementary colors for contrast, analogous for harmony. Consider color psychology and accessibility. Maintain sufficient contrast ratios (4.5:1 for normal text)."
            ),
            MockTestQuestion(
                question="What is typography and what makes good typography in digital interfaces?",
                answer="Typography is the art of arranging text. Good digital typography uses readable fonts, appropriate sizes (16px+ for body), proper line spacing (1.4-1.6), adequate contrast, and hierarchy through size and weight."
            ),
            MockTestQuestion(
                question="Explain responsive design principles.",
                answer="Responsive design adapts to different screen sizes. Use flexible grids, scalable images, and CSS media queries. Follow mobile-first approach, design for touch interfaces, and ensure content remains accessible across devices."
            )
        ]
    
    def _create_general_tech_test_questions(self, expertise: str) -> List[MockTestQuestion]:
        """Create general technology test questions"""
        return [
            MockTestQuestion(
                question="What is version control and why is it important in software development?",
                answer="Version control tracks changes to code over time. It enables collaboration, backup, branching for features, and rollback to previous versions. Git is the most popular system, enabling distributed development."
            ),
            MockTestQuestion(
                question="Explain the difference between frontend and backend development.",
                answer="Frontend handles user interface and user experience (HTML, CSS, JavaScript). Backend handles server logic, databases, and APIs (Python, Java, Node.js). They communicate through APIs to create complete applications."
            ),
            MockTestQuestion(
                question="What is an API and how do RESTful APIs work?",
                answer="API (Application Programming Interface) allows applications to communicate. REST uses HTTP methods (GET, POST, PUT, DELETE) with stateless requests. Returns data in JSON format with proper status codes."
            ),
            MockTestQuestion(
                question="What are the key principles of good software architecture?",
                answer="Key principles include: modularity, separation of concerns, loose coupling, high cohesion, scalability, maintainability, and following design patterns. Good architecture makes code easier to understand, test, and modify."
            ),
            MockTestQuestion(
                question="Explain the importance of testing in software development.",
                answer="Testing ensures code works correctly and prevents bugs. Types include unit tests (individual functions), integration tests (component interaction), and end-to-end tests (full user workflows). Automated testing saves time and improves reliability."
            )
        ]
    
    def extract_skills_from_message(self, message: str, current_skills: str = "") -> Dict[str, Any]:
        """Extract and merge skills from user message using available AI services with fallbacks"""
        
        prompt = f"""
        A user has shared information about their learning or skills. Please extract any technical skills, technologies, programming languages, tools, or professional competencies mentioned.
        
        User message: "{message}"
        Current skills: "{current_skills}"
        
        Please provide a JSON response with the following structure:
        {{
            "extracted_skills": ["skill1", "skill2", "skill3"],
            "updated_skills": "merged and deduplicated list of all skills as a comma-separated string",
            "bot_response": "A friendly response acknowledging what the user learned and encouraging them"
        }}
        
        Rules:
        1. Extract only actual skills, technologies, or competencies
        2. Merge with existing skills, avoiding duplicates
        3. Keep the response encouraging and supportive
        4. If no new skills are found, return empty extracted_skills array but still provide a helpful response
        """

        # Try Vertex AI first if available
        if self.vertex_ai_available and self.model:
            try:
                response = self.model.generate_content(prompt)
                response_text = response.text
                
                # Try to find JSON in the response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_str = response_text[start_idx:end_idx]
                    result = json.loads(json_str)
                    print("✅ Extracted skills using Vertex AI")
                    return result
                    
            except Exception as e:
                print(f"Vertex AI skill extraction failed: {e}")
        
        # Try fallback AI services
        ai_response = self._generate_with_fallback_ai(prompt)
        if ai_response:
            try:
                # Try to extract JSON from AI response
                start_idx = ai_response.find('{')
                end_idx = ai_response.rfind('}') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_str = ai_response[start_idx:end_idx]
                    return json.loads(json_str)
            except Exception as e:
                print(f"Error parsing AI skill extraction response: {e}")
        
        # Fallback to static response
        print("🔍 Using enhanced static skill extraction")
        return self._create_enhanced_fallback_skill_response(message, current_skills)
    
    def _create_enhanced_fallback_skill_response(self, message: str, current_skills: str) -> Dict[str, Any]:
        """Create an enhanced fallback response for skill extraction using pattern matching"""
        
        # Use the same pattern matching as _extract_skills_fallback
        result = self._extract_skills_fallback(message)
        extracted_skills_data = result.get("extracted_skills", [])
        
        # Convert to skill names only for merging
        extracted_skills = [skill["skill"] for skill in extracted_skills_data]
        
        # Merge with current skills
        current_skills_list = [skill.strip() for skill in current_skills.split(",") if skill.strip()] if current_skills else []
        all_skills = current_skills_list + extracted_skills
        
        # Remove duplicates while preserving order
        seen = set()
        unique_skills = []
        for skill in all_skills:
            skill_lower = skill.lower()
            if skill_lower not in seen:
                seen.add(skill_lower)
                unique_skills.append(skill)
        
        updated_skills = ", ".join(unique_skills)
        
        # Generate encouraging response based on extracted skills
        if extracted_skills:
            if len(extracted_skills) == 1:
                bot_response = f"Great job learning {extracted_skills[0]}! That's a valuable skill that will serve you well in your career journey. Keep up the excellent work! 🚀"
            else:
                skills_text = ", ".join(extracted_skills[:-1]) + f" and {extracted_skills[-1]}"
                bot_response = f"Wow, you've been busy! Learning {skills_text} shows real dedication to your professional growth. These skills will definitely boost your career prospects! 🎆"
        else:
            # Encouraging response even when no skills detected
            encouraging_responses = [
                "Thanks for sharing! I'm here to help you track your learning journey. Feel free to tell me about any new skills, technologies, or courses you've been working on! 📚",
                "I love hearing about your progress! Whether it's coding, design, or any other skills, I'm here to help you map out your career path. What would you like to explore next? 🎯",
                "Your dedication to learning is inspiring! Keep me updated on any new technologies or skills you pick up - I'll help you see how they fit into your career growth! ✨",
                "Every learning step counts towards your goals! Feel free to share any courses, tutorials, or projects you're working on. I'm here to support your journey! 🌱"
            ]
            import random
            bot_response = random.choice(encouraging_responses)
        
        return {
            "extracted_skills": extracted_skills,
            "updated_skills": updated_skills,
            "bot_response": bot_response
        }
    
    def _create_enhanced_fallback_resources(self, skills: str, expertise: str, limit: int, topic: str = None) -> Dict[str, Any]:
        """Create enhanced fallback learning resources based on user skills and expertise"""
        
        skills_lower = skills.lower()
        
        # Determine primary domain based on skills
        if any(skill in skills_lower for skill in ['python', 'programming', 'coding', 'software']):
            return self._create_programming_resources(expertise, limit)
        elif any(skill in skills_lower for skill in ['javascript', 'js', 'react', 'frontend', 'web']):
            return self._create_frontend_resources(expertise, limit)
        elif any(skill in skills_lower for skill in ['data', 'analytics', 'sql', 'machine learning', 'ai']):
            return self._create_data_science_resources(expertise, limit)
        elif any(skill in skills_lower for skill in ['design', 'ui', 'ux', 'figma']):
            return self._create_design_resources(expertise, limit)
        elif any(skill in skills_lower for skill in ['marketing', 'social media', 'seo', 'content']):
            return self._create_marketing_resources(expertise, limit)
        elif any(skill in skills_lower for skill in ['project management', 'agile', 'scrum', 'leadership']):
            return self._create_management_resources(expertise, limit)
        else:
            return self._create_general_tech_resources(expertise, limit)
    
    def _create_programming_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create programming-specific learning resources"""
        
        youtube_courses = [
            {"title": "Python Full Course for Beginners - Programming with Mosh", "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc"},
            {"title": "Complete Python Tutorial - Tech With Tim", "url": "https://www.youtube.com/watch?v=sxTmJE4k0ho"},
            {"title": "Advanced Python - Corey Schafer", "url": "https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU"},
            {"title": "Software Engineering Principles - MIT OpenCourseWare", "url": "https://www.youtube.com/playlist?list=PLUl4u3cNGP63WbdFxL8giv4yhgdMGaZNA"},
            {"title": "System Design Interview - Gaurav Sen", "url": "https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX"},
            {"title": "Clean Code - Uncle Bob", "url": "https://www.youtube.com/watch?v=7EmboKQH8lM"},
            {"title": "Git and GitHub Tutorial - Traversy Media", "url": "https://www.youtube.com/watch?v=SWYqp7iY_Tc"}
        ]
        
        articles = [
            {"title": "Python Best Practices and Tips", "url": "https://realpython.com/python-best-practices/"},
            {"title": "Clean Code Principles in Python", "url": "https://medium.com/swlh/clean-code-in-python-78a8b4f3e4f9"},
            {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer"},
            {"title": "Python Design Patterns", "url": "https://refactoring.guru/design-patterns/python"},
            {"title": "Software Engineering Best Practices", "url": "https://github.com/microsoft/code-with-engineering-playbook"},
            {"title": "Python Performance Tips", "url": "https://wiki.python.org/moin/PythonSpeed/PerformanceTips"},
            {"title": "Code Review Best Practices", "url": "https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/"}
        ]
        
        # Filter based on expertise level
        if expertise.lower() in ['beginner', 'entry']:
            youtube_courses = [c for c in youtube_courses if any(word in c['title'].lower() for word in ['beginner', 'full course', 'tutorial', 'complete'])]
            articles = [a for a in articles if any(word in a['title'].lower() for word in ['tips', 'best practices', 'primer'])]
        elif expertise.lower() in ['advanced', 'expert']:
            youtube_courses = [c for c in youtube_courses if any(word in c['title'].lower() for word in ['advanced', 'system design', 'clean code', 'engineering'])]
            articles = [a for a in articles if any(word in a['title'].lower() for word in ['design patterns', 'performance', 'engineering', 'advanced'])]
        
        return {
            "youtube_courses": youtube_courses[:limit],
            "articles": articles[:limit]
        }
    
    def _create_frontend_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create frontend development learning resources"""
        
        youtube_courses = [
            {"title": "React.js Full Course - freeCodeCamp", "url": "https://www.youtube.com/watch?v=4UZrsTqkcW4"},
            {"title": "JavaScript Crash Course - Traversy Media", "url": "https://www.youtube.com/watch?v=hdI2bqOjy3c"},
            {"title": "Advanced React Patterns - Kent C. Dodds", "url": "https://www.youtube.com/playlist?list=PLV5CVI1eNcJgCrPH_e6d57KRUTiDZgs0u"},
            {"title": "CSS Grid and Flexbox - Wes Bos", "url": "https://www.youtube.com/watch?v=T-slCsOrLcc"},
            {"title": "Modern JavaScript (ES6+) - The Net Ninja", "url": "https://www.youtube.com/playlist?list=PL4cUxeGkcC9haFPT7J25Q9GRB_ZkFrQAc"},
            {"title": "Vue.js Complete Course - Academind", "url": "https://www.youtube.com/watch?v=FXpIoQ_rT_c"},
            {"title": "Web Performance Optimization - Google Developers", "url": "https://www.youtube.com/playlist?list=PLNYkxOF6rcIBGvYSYO-VxOsaYQDw5rifJ"}
        ]
        
        articles = [
            {"title": "React Best Practices and Patterns", "url": "https://reactjs.org/docs/thinking-in-react.html"},
            {"title": "Modern JavaScript Features", "url": "https://github.com/tc39/proposals/blob/HEAD/finished-proposals.md"},
            {"title": "CSS-Tricks Complete Guide to Flexbox", "url": "https://css-tricks.com/snippets/css/a-guide-to-flexbox/"},
            {"title": "Frontend Performance Checklist", "url": "https://github.com/thedaviddias/Front-End-Performance-Checklist"},
            {"title": "JavaScript Design Patterns", "url": "https://addyosmani.com/resources/essentialjsdesignpatterns/book/"},
            {"title": "Web Accessibility Guidelines", "url": "https://webaim.org/standards/wcag/checklist"},
            {"title": "Progressive Web Apps Guide", "url": "https://web.dev/progressive-web-apps/"}
        ]
        
        return {
            "youtube_courses": youtube_courses[:limit],
            "articles": articles[:limit]
        }
    
    def _create_data_science_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create data science learning resources"""
        
        youtube_courses = [
            {"title": "Python for Data Science - freeCodeCamp", "url": "https://www.youtube.com/watch?v=LHBE6Q9XlzI"},
            {"title": "Machine Learning Course - Andrew Ng", "url": "https://www.youtube.com/playlist?list=PLLssT5z_DsK-h9vYZkQkYNWcItqhlRJLN"},
            {"title": "Data Analysis with Pandas - Corey Schafer", "url": "https://www.youtube.com/playlist?list=PL-osiE80TeTsWmV9i9c58mdDCSskIFdDS"},
            {"title": "SQL Tutorial - W3Schools", "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY"},
            {"title": "Deep Learning Specialization - deeplearning.ai", "url": "https://www.youtube.com/channel/UCcIXc5mJsHVYTZR1maL5l9w"},
            {"title": "Statistics for Data Science - StatQuest", "url": "https://www.youtube.com/channel/UCtYLUTtgS3k1Fg4y5tAhLbw"},
            {"title": "Tableau Tutorial - Tableau", "url": "https://www.youtube.com/user/tableautraining"}
        ]
        
        articles = [
            {"title": "Pandas Documentation and Tutorials", "url": "https://pandas.pydata.org/docs/user_guide/index.html"},
            {"title": "Scikit-learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html"},
            {"title": "Data Science Project Ideas", "url": "https://github.com/NirantK/awesome-project-ideas"},
            {"title": "Machine Learning Yearning", "url": "https://github.com/ajaymache/machine-learning-yearning"},
            {"title": "Feature Engineering Techniques", "url": "https://towardsdatascience.com/feature-engineering-for-machine-learning-3a5e293a5114"},
            {"title": "Data Visualization Best Practices", "url": "https://serialmentor.com/dataviz/"},
            {"title": "SQL Performance Tuning", "url": "https://use-the-index-luke.com/"}
        ]
        
        return {
            "youtube_courses": youtube_courses[:limit],
            "articles": articles[:limit]
        }
    
    def _create_design_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create design learning resources"""
        
        youtube_courses = [
            {"title": "UI/UX Design Tutorial - AJ&Smart", "url": "https://www.youtube.com/c/AJSmart"},
            {"title": "Figma Tutorial - DesignCourse", "url": "https://www.youtube.com/watch?v=3q3FV65ZrUs"},
            {"title": "Design Systems - Design+Code", "url": "https://www.youtube.com/watch?v=wc5krSTA8ds"},
            {"title": "Color Theory for Designers - Will Paterson", "url": "https://www.youtube.com/watch?v=AvgCkHrcj90"},
            {"title": "Typography Fundamentals - Flux", "url": "https://www.youtube.com/watch?v=qaZK9Awi0Nk"},
            {"title": "User Research Methods - NNGroup", "url": "https://www.youtube.com/user/NNgroup"},
            {"title": "Accessibility in Design - Google Design", "url": "https://www.youtube.com/playlist?list=PLJ21zHI2TNh_hU6khn7BzJrGfNQA-TCLE"}
        ]
        
        articles = [
            {"title": "Design Systems Handbook", "url": "https://www.designbetter.co/design-systems-handbook"},
            {"title": "Material Design Guidelines", "url": "https://material.io/design"},
            {"title": "Laws of UX", "url": "https://lawsofux.com/"},
            {"title": "Inclusive Design Principles", "url": "https://inclusivedesignprinciples.org/"},
            {"title": "Design Pattern Library", "url": "https://ui-patterns.com/patterns"},
            {"title": "Color Accessibility Guidelines", "url": "https://webaim.org/articles/contrast/"},
            {"title": "User Research Methods Guide", "url": "https://www.nngroup.com/articles/which-ux-research-methods/"}
        ]
        
        return {
            "youtube_courses": youtube_courses[:limit],
            "articles": articles[:limit]
        }
    
    def _create_marketing_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create marketing learning resources"""
        
        youtube_courses = [
            {"title": "Digital Marketing Course - Google Digital Garage", "url": "https://www.youtube.com/watch?v=bixR-KIJKYM"},
            {"title": "SEO Tutorial - Moz", "url": "https://www.youtube.com/user/MozHQ"},
            {"title": "Social Media Marketing - HubSpot", "url": "https://www.youtube.com/user/HubSpot"},
            {"title": "Content Marketing - Neil Patel", "url": "https://www.youtube.com/user/neilvkpatel"},
            {"title": "Email Marketing - Mailchimp", "url": "https://www.youtube.com/user/MailChimp"},
            {"title": "Google Analytics - Google Analytics", "url": "https://www.youtube.com/user/googleanalytics"},
            {"title": "Growth Hacking - GrowthHackers", "url": "https://www.youtube.com/channel/UCN20PbGdCq3fQ8pP_PoFGRw"}
        ]
        
        articles = [
            {"title": "HubSpot Marketing Hub", "url": "https://blog.hubspot.com/marketing"},
            {"title": "Moz SEO Learning Center", "url": "https://moz.com/learn/seo"},
            {"title": "Content Marketing Institute", "url": "https://contentmarketinginstitute.com/"},
            {"title": "Social Media Examiner", "url": "https://www.socialmediaexaminer.com/"},
            {"title": "Google Ads Help Center", "url": "https://support.google.com/google-ads"},
            {"title": "Facebook Business Help Center", "url": "https://www.facebook.com/business/help"},
            {"title": "Marketing Land", "url": "https://marketingland.com/"}
        ]
        
        return {
            "youtube_courses": youtube_courses[:limit],
            "articles": articles[:limit]
        }
    
    def _create_management_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create project management learning resources"""
        
        youtube_courses = [
            {"title": "Project Management Fundamentals - PMI", "url": "https://www.youtube.com/user/PMInstitute"},
            {"title": "Agile and Scrum Tutorial - Simplilearn", "url": "https://www.youtube.com/watch?v=9TycLR0TqFA"},
            {"title": "Leadership Skills - Harvard Business Review", "url": "https://www.youtube.com/user/HarvardBusiness"},
            {"title": "Team Management - Brian Tracy", "url": "https://www.youtube.com/user/BrianTracySpeaker"},
            {"title": "Product Management - Product School", "url": "https://www.youtube.com/channel/UC6hlQ0x6kPbAGjYkoz53cvA"},
            {"title": "Kanban Tutorial - Kanbanize", "url": "https://www.youtube.com/user/KanbanizeTV"},
            {"title": "Remote Team Management - Buffer", "url": "https://www.youtube.com/c/bufferapp"}
        ]
        
        articles = [
            {"title": "Project Management Institute Guide", "url": "https://www.pmi.org/learning/library"},
            {"title": "Agile Alliance Resources", "url": "https://www.agilealliance.org/agile101/"},
            {"title": "Scrum Guide Official", "url": "https://scrumguides.org/scrum-guide.html"},
            {"title": "Product Management Resources", "url": "https://www.productplan.com/learn/"},
            {"title": "Leadership Best Practices", "url": "https://hbr.org/topic/leadership"},
            {"title": "Remote Work Best Practices", "url": "https://blog.trello.com/remote-work-team-management-tips"},
            {"title": "Team Building Strategies", "url": "https://www.atlassian.com/team-playbook"}
        ]
        
        return {
            "youtube_courses": youtube_courses[:limit],
            "articles": articles[:limit]
        }
    
    def _create_general_tech_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create general technology learning resources"""
        
        youtube_courses = [
            {"title": "Computer Science Fundamentals - CS50 Harvard", "url": "https://www.youtube.com/user/cs50tv"},
            {"title": "Software Engineering - MIT OpenCourseWare", "url": "https://www.youtube.com/user/MIT"},
            {"title": "Cloud Computing - AWS", "url": "https://www.youtube.com/user/AmazonWebServices"},
            {"title": "Cybersecurity Fundamentals - SANS", "url": "https://www.youtube.com/user/SANSInstitute"},
            {"title": "DevOps Tutorial - TechWorld with Nana", "url": "https://www.youtube.com/c/TechWorldwithNana"},
            {"title": "Algorithms and Data Structures - MIT", "url": "https://www.youtube.com/playlist?list=PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb"},
            {"title": "Tech Career Advice - TechLead", "url": "https://www.youtube.com/c/TechLead"}
        ]
        
        articles = [
            {"title": "Free Programming Books", "url": "https://github.com/EbookFoundation/free-programming-books"},
            {"title": "System Design Interview", "url": "https://github.com/donnemartin/system-design-primer"},
            {"title": "Tech Interview Handbook", "url": "https://github.com/yangshun/tech-interview-handbook"},
            {"title": "Awesome Lists Collection", "url": "https://github.com/sindresorhus/awesome"},
            {"title": "DevOps Roadmap", "url": "https://roadmap.sh/devops"},
            {"title": "Cloud Computing Guide", "url": "https://aws.amazon.com/getting-started/"},
            {"title": "Open Source Contribution Guide", "url": "https://opensource.guide/"}
        ]
        
        return {
            "youtube_courses": youtube_courses[:limit],
            "articles": articles[:limit]
        }
    
    def extract_skills_with_levels(self, message: str) -> Dict[str, Any]:
        """Extract skills and expertise levels from message using available AI services with fallbacks"""
        
        prompt = f"""
        Extract all new skills and expertise levels mentioned in this message: "{message}"
        
        Return a JSON array with the following structure:
        [
          {{"skill": "skill name", "expertise_level": "beginner/intermediate/advanced/expert"}},
          {{"skill": "skill name", "expertise_level": "beginner/intermediate/advanced/expert"}}
        ]
        
        Rules:
        1. Extract only actual technical skills, programming languages, tools, or professional competencies
        2. Infer the expertise level from context (if someone "learned" something = beginner, "worked with" = intermediate, "mastered" = advanced, etc.)
        3. If no level is mentioned, default to "beginner" for new learning, "intermediate" for general experience
        4. Return empty array if no skills are found
        5. Skills should be properly formatted (e.g., "JavaScript", "React", "Python", "SQL")
        """

        # Try Vertex AI first if available
        if self.vertex_ai_available and self.model:
            try:
                response = self.model.generate_content(prompt)
                response_text = response.text
                
                # Try to find JSON in the response
                start_idx = response_text.find('[')
                end_idx = response_text.rfind(']') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_str = response_text[start_idx:end_idx]
                    extracted_skills = json.loads(json_str)
                    print("✅ Extracted skills with levels using Vertex AI")
                    return {"extracted_skills": extracted_skills}
                    
            except Exception as e:
                print(f"Vertex AI skill level extraction failed: {e}")
        
        # Try fallback AI services
        ai_response = self._generate_with_fallback_ai(prompt)
        if ai_response:
            try:
                # Try to extract JSON from AI response
                start_idx = ai_response.find('[')
                end_idx = ai_response.rfind(']') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_str = ai_response[start_idx:end_idx]
                    extracted_skills = json.loads(json_str)
                    return {"extracted_skills": extracted_skills}
            except Exception as e:
                print(f"Error parsing AI skill level extraction response: {e}")
        
        # Fallback to static extraction
        print("🎯 Using enhanced static skill level extraction")
        return self._extract_skills_fallback(message)
    
    def _extract_skills_fallback(self, message: str) -> Dict[str, Any]:
        """Fallback skill extraction when AI is not available"""
        # Common technical skills and tools to look for
        skill_patterns = {
            # Programming Languages
            'python': 'Python',
            'javascript': 'JavaScript',
            'java': 'Java',
            'c#': 'C#',
            'c++': 'C++',
            'typescript': 'TypeScript',
            'php': 'PHP',
            'ruby': 'Ruby',
            'go': 'Go',
            'rust': 'Rust',
            'swift': 'Swift',
            'kotlin': 'Kotlin',
            
            # Frontend Technologies
            'react': 'React',
            'vue': 'Vue.js',
            'angular': 'Angular',
            'html': 'HTML',
            'css': 'CSS',
            'bootstrap': 'Bootstrap',
            'tailwind': 'Tailwind CSS',
            'sass': 'SASS',
            'jquery': 'jQuery',
            
            # Backend Technologies
            'node.js': 'Node.js',
            'nodejs': 'Node.js',
            'express': 'Express.js',
            'django': 'Django',
            'flask': 'Flask',
            'spring': 'Spring',
            'laravel': 'Laravel',
            'rails': 'Ruby on Rails',
            
            # Databases
            'sql': 'SQL',
            'mysql': 'MySQL',
            'postgresql': 'PostgreSQL',
            'mongodb': 'MongoDB',
            'sqlite': 'SQLite',
            'redis': 'Redis',
            'firestore': 'Firestore',
            
            # DevOps and Tools
            'docker': 'Docker',
            'kubernetes': 'Kubernetes',
            'aws': 'AWS',
            'azure': 'Azure',
            'gcp': 'Google Cloud Platform',
            'git': 'Git',
            'jenkins': 'Jenkins',
            'terraform': 'Terraform',
            
            # Machine Learning / AI
            'machine learning': 'Machine Learning',
            'tensorflow': 'TensorFlow',
            'pytorch': 'PyTorch',
            'pandas': 'Pandas',
            'numpy': 'NumPy',
            'scikit-learn': 'Scikit-learn',
            
            # Other
            'api': 'API Development',
            'rest': 'REST APIs',
            'graphql': 'GraphQL',
            'microservices': 'Microservices',
            'agile': 'Agile',
            'scrum': 'Scrum'
        }
        
        message_lower = message.lower()
        extracted_skills = []
        
        # Look for skill mentions in the message
        for pattern, skill_name in skill_patterns.items():
            if pattern in message_lower:
                # Infer expertise level from context
                expertise_level = 'beginner'  # default
                
                if any(word in message_lower for word in ['expert', 'mastered', 'advanced', 'proficient']):
                    expertise_level = 'expert'
                elif any(word in message_lower for word in ['experienced', 'worked with', 'using', 'good at']):
                    expertise_level = 'intermediate'
                elif any(word in message_lower for word in ['learned', 'learning', 'started', 'new to']):
                    expertise_level = 'beginner'
                elif any(word in message_lower for word in ['improved', 'better', 'advanced']):
                    expertise_level = 'intermediate'
                    
                extracted_skills.append({
                    'skill': skill_name,
                    'expertise_level': expertise_level
                })
        
        # Remove duplicates
        seen = set()
        unique_skills = []
        for skill in extracted_skills:
            skill_key = skill['skill'].lower()
            if skill_key not in seen:
                seen.add(skill_key)
                unique_skills.append(skill)
        
        return {"extracted_skills": unique_skills}
    
    # Topic-specific resource creation methods
    def _get_software_development_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create software development learning resources"""
        return self._create_programming_resources(expertise, limit)
    
    def _get_web_development_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create web development learning resources"""
        return self._create_frontend_resources(expertise, limit)
    
    def _get_data_science_resources_detailed(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create detailed data science learning resources"""
        return self._create_data_science_resources(expertise, limit)
    
    def _get_ai_ml_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create AI/ML specific learning resources"""
        youtube_courses = [
            {"title": "Machine Learning Course - Stanford CS229", "url": "https://www.youtube.com/playlist?list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU"},
            {"title": "Deep Learning Specialization - Andrew Ng", "url": "https://www.youtube.com/channel/UCcIXc5mJsHVYTZR1maL5l9w"},
            {"title": "MIT 6.034 Artificial Intelligence", "url": "https://www.youtube.com/playlist?list=PLUl4u3cNGP63gFHB6xb-kVBiQHYe_4hSi"},
            {"title": "PyTorch Tutorial - Python Engineer", "url": "https://www.youtube.com/playlist?list=PLqnslRFeH2UrcDBWF5mfPGpqQDSta6VK4"},
            {"title": "TensorFlow 2.0 Complete Course - freeCodeCamp", "url": "https://www.youtube.com/watch?v=tPYj3fFJGjk"},
            {"title": "Natural Language Processing - Stanford CS224N", "url": "https://www.youtube.com/playlist?list=PLoROMvodv4rOSH4v6133s9LFPRHjEmbmJ"},
            {"title": "Computer Vision - Stanford CS231n", "url": "https://www.youtube.com/playlist?list=PL3FW7Lu3i5JvHM8ljYj-zLfQRF3EO8sYv"}
        ]
        
        articles = [
            {"title": "Machine Learning Mastery", "url": "https://machinelearningmastery.com/"},
            {"title": "Papers With Code", "url": "https://paperswithcode.com/"},
            {"title": "Towards Data Science", "url": "https://towardsdatascience.com/"},
            {"title": "OpenAI Research", "url": "https://openai.com/research/"},
            {"title": "Google AI Blog", "url": "https://ai.googleblog.com/"},
            {"title": "Distill - Clear explanations of ML", "url": "https://distill.pub/"},
            {"title": "AI Research Papers - arXiv", "url": "https://arxiv.org/list/cs.AI/recent"}
        ]
        
        return {
            "youtube_courses": youtube_courses[:limit],
            "articles": articles[:limit]
        }
    
    def _get_mobile_development_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create mobile development learning resources"""
        youtube_courses = [
            {"title": "React Native Tutorial - Programming with Mosh", "url": "https://www.youtube.com/watch?v=0-S5a0eXPoc"},
            {"title": "Flutter Crash Course - Traversy Media", "url": "https://www.youtube.com/watch?v=1gDhl4leEzA"},
            {"title": "Android Development - Android Developers", "url": "https://www.youtube.com/user/androiddevelopers"},
            {"title": "iOS Development with Swift - CodeWithChris", "url": "https://www.youtube.com/user/CodeWithChris"},
            {"title": "Kotlin for Android - Coding in Flow", "url": "https://www.youtube.com/channel/UC_Fh8kvtkVPkeihBs42jGcA"},
            {"title": "Xamarin Tutorial - Microsoft Developer", "url": "https://www.youtube.com/c/MicrosoftDeveloper"},
            {"title": "Mobile App Design - AJ&Smart", "url": "https://www.youtube.com/c/AJSmart"}
        ]
        
        articles = [
            {"title": "React Native Documentation", "url": "https://reactnative.dev/docs/getting-started"},
            {"title": "Flutter Documentation", "url": "https://flutter.dev/docs"},
            {"title": "Android Developer Guides", "url": "https://developer.android.com/guide"},
            {"title": "iOS Human Interface Guidelines", "url": "https://developer.apple.com/design/human-interface-guidelines/"},
            {"title": "Mobile App Development Best Practices", "url": "https://www.smashingmagazine.com/category/mobile/"},
            {"title": "Cross-Platform Development Guide", "url": "https://ionic.io/resources/articles"},
            {"title": "Mobile Performance Optimization", "url": "https://web.dev/mobile/"}
        ]
        
        return {
            "youtube_courses": youtube_courses[:limit],
            "articles": articles[:limit]
        }
    
    def _get_devops_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create DevOps learning resources"""
        youtube_courses = [
            {"title": "Docker Tutorial - TechWorld with Nana", "url": "https://www.youtube.com/watch?v=3c-iBn73dDE"},
            {"title": "Kubernetes Tutorial - TechWorld with Nana", "url": "https://www.youtube.com/watch?v=X48VuDVv0do"},
            {"title": "AWS Tutorial - freeCodeCamp", "url": "https://www.youtube.com/watch?v=3hLmDS179YE"},
            {"title": "Terraform Tutorial - HashiCorp", "url": "https://www.youtube.com/c/HashiCorp"},
            {"title": "Jenkins Tutorial - Edureka", "url": "https://www.youtube.com/watch?v=FX322RVNGj4"},
            {"title": "Ansible Tutorial - TechWorld with Nana", "url": "https://www.youtube.com/watch?v=1id6ERvfozo"},
            {"title": "DevOps Engineering Course - freeCodeCamp", "url": "https://www.youtube.com/watch?v=j5Zsa_eOXeY"}
        ]
        
        articles = [
            {"title": "DevOps Roadmap", "url": "https://roadmap.sh/devops"},
            {"title": "Docker Documentation", "url": "https://docs.docker.com/"},
            {"title": "Kubernetes Documentation", "url": "https://kubernetes.io/docs/home/"},
            {"title": "AWS Well-Architected Framework", "url": "https://aws.amazon.com/architecture/well-architected/"},
            {"title": "The Twelve-Factor App", "url": "https://12factor.net/"},
            {"title": "Site Reliability Engineering", "url": "https://sre.google/sre-book/table-of-contents/"},
            {"title": "Infrastructure as Code Best Practices", "url": "https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html"}
        ]
        
        return {
            "youtube_courses": youtube_courses[:limit],
            "articles": articles[:limit]
        }
    
    def _get_cybersecurity_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create cybersecurity learning resources"""
        youtube_courses = [
            {"title": "Cybersecurity Full Course - edX", "url": "https://www.youtube.com/watch?v=inWWhr5tnEA"},
            {"title": "Ethical Hacking - Cybrary", "url": "https://www.youtube.com/c/CybraryIT"},
            {"title": "Network Security - Professor Messer", "url": "https://www.youtube.com/c/professormesser"},
            {"title": "CISSP Training - InfoSec Institute", "url": "https://www.youtube.com/user/InfoSecInstitute"},
            {"title": "Penetration Testing - The Cyber Mentor", "url": "https://www.youtube.com/c/TheCyberMentor"},
            {"title": "Malware Analysis - OALabs", "url": "https://www.youtube.com/c/OALabs"},
            {"title": "Digital Forensics - 13Cubed", "url": "https://www.youtube.com/c/13cubed"}
        ]
        
        articles = [
            {"title": "NIST Cybersecurity Framework", "url": "https://www.nist.gov/cyberframework"},
            {"title": "OWASP Top 10", "url": "https://owasp.org/www-project-top-ten/"},
            {"title": "Cybersecurity & Infrastructure Security Agency", "url": "https://www.cisa.gov/"},
            {"title": "Krebs on Security", "url": "https://krebsonsecurity.com/"},
            {"title": "SANS Reading Room", "url": "https://www.sans.org/reading-room/"},
            {"title": "Cybersecurity Best Practices", "url": "https://www.sans.org/security-resources/"},
            {"title": "Threat Intelligence Reports", "url": "https://attack.mitre.org/"}
        ]
        
        return {
            "youtube_courses": youtube_courses[:limit],
            "articles": articles[:limit]
        }
    
    def _get_design_resources_detailed(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create detailed design learning resources"""
        return self._create_design_resources(expertise, limit)
    
    def _get_blockchain_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create blockchain learning resources"""
        youtube_courses = [
            {"title": "Blockchain Full Course - freeCodeCamp", "url": "https://www.youtube.com/watch?v=gyMwXuJrbJQ"},
            {"title": "Solidity Tutorial - Smart Contract Programmer", "url": "https://www.youtube.com/c/SmartContractProgrammer"},
            {"title": "Web3 Development - Dapp University", "url": "https://www.youtube.com/c/DappUniversity"},
            {"title": "Ethereum Development - Patrick Collins", "url": "https://www.youtube.com/c/PatrickCollins"},
            {"title": "DeFi Tutorial - Finematics", "url": "https://www.youtube.com/c/Finematics"},
            {"title": "NFT Development - HashLips", "url": "https://www.youtube.com/c/HashLipsNFT"},
            {"title": "Cryptocurrency Trading - Coin Bureau", "url": "https://www.youtube.com/c/CoinBureau"}
        ]
        
        articles = [
            {"title": "Ethereum Documentation", "url": "https://ethereum.org/en/developers/docs/"},
            {"title": "Solidity Documentation", "url": "https://docs.soliditylang.org/"},
            {"title": "Web3.js Documentation", "url": "https://web3js.readthedocs.io/"},
            {"title": "OpenZeppelin Contracts", "url": "https://docs.openzeppelin.com/contracts/"},
            {"title": "DeFi Pulse - DeFi Rankings", "url": "https://defipulse.com/"},
            {"title": "CoinDesk - Blockchain News", "url": "https://www.coindesk.com/"},
            {"title": "Blockchain Council Resources", "url": "https://www.blockchain-council.org/"}
        ]
        
        return {
            "youtube_courses": youtube_courses[:limit],
            "articles": articles[:limit]
        }
    
    def _get_game_development_resources(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create game development learning resources"""
        youtube_courses = [
            {"title": "Unity Game Development - Brackeys", "url": "https://www.youtube.com/user/Brackeys"},
            {"title": "Unreal Engine Tutorial - Ryan Laley", "url": "https://www.youtube.com/c/RyanLaley"},
            {"title": "Godot Game Engine - GDQuest", "url": "https://www.youtube.com/c/Gdquest"},
            {"title": "C# for Unity - Code Monkey", "url": "https://www.youtube.com/c/CodeMonkeyUnity"},
            {"title": "Game Design Fundamentals - Extra Credits", "url": "https://www.youtube.com/extracredits"},
            {"title": "2D Game Art - AdamCYounis", "url": "https://www.youtube.com/user/AdamCYounis"},
            {"title": "Blender for Games - CG Cookie", "url": "https://www.youtube.com/user/blendercookie"}
        ]
        
        articles = [
            {"title": "Unity Learn Platform", "url": "https://learn.unity.com/"},
            {"title": "Unreal Engine Documentation", "url": "https://docs.unrealengine.com/"},
            {"title": "Godot Engine Documentation", "url": "https://docs.godotengine.org/"},
            {"title": "Game Development Patterns", "url": "https://gameprogrammingpatterns.com/"},
            {"title": "Gamasutra - Game Development", "url": "https://www.gamasutra.com/"},
            {"title": "IndieDB - Independent Games", "url": "https://www.indiedb.com/"},
            {"title": "GDC Vault - Game Developers Conference", "url": "https://www.gdcvault.com/"}
        ]
        
        return {
            "youtube_courses": youtube_courses[:limit],
            "articles": articles[:limit]
        }
    
    def _get_marketing_resources_detailed(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create detailed marketing learning resources"""
        return self._create_marketing_resources(expertise, limit)
    
    def _get_management_resources_detailed(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create detailed management learning resources"""
        return self._create_management_resources(expertise, limit)
    
    def _get_general_tech_resources_detailed(self, expertise: str, limit: int) -> Dict[str, Any]:
        """Create detailed general tech learning resources"""
        return self._create_general_tech_resources(expertise, limit)
    
    def generate_learning_resources(self, skills: str, expertise: str, limit: int = 5, topic: str = None) -> Dict[str, Any]:
        """Generate learning resources including YouTube courses and articles using available AI services with fallbacks"""
        
        # Build topic-specific context for the prompt
        topic_context = ""
        if topic and topic.lower() != 'all':
            topic_context = f" with a focus on {topic}"
        
        prompt = f"""
        For a user with skills {skills} and expertise {expertise}{topic_context}, 
        suggest {limit} best YouTube courses and {limit} best articles to improve their career path.
        Return strictly in JSON format:
        {{
          "youtube_courses": [
            {{"title": "...", "url": "..."}}
          ],
          "articles": [
            {{"title": "...", "url": "..."}}
          ]
        }}
        
        Make sure the resources are:
        1. Relevant to the specified skills and expertise level{' and focused on ' + topic if topic and topic.lower() != 'all' else ''}
        2. High-quality and from reputable sources
        3. Appropriate for career advancement
        4. Include real, working URLs when possible
        5. Cover both foundational and advanced topics based on expertise level
        {f'6. Specifically focused on {topic} topics and technologies' if topic and topic.lower() != 'all' else ''}
        """

        # Try Vertex AI first if available
        if self.vertex_ai_available and self.model:
            try:
                response = self.model.generate_content(prompt)
                response_text = response.text
                
                # Extract JSON from response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_str = response_text[start_idx:end_idx]
                    result = json.loads(json_str)
                    print("✅ Generated learning resources using Vertex AI")
                    return result
                    
            except Exception as e:
                print(f"Vertex AI resource generation failed: {e}")
        
        # Try fallback AI services
        ai_response = self._generate_with_fallback_ai(prompt)
        if ai_response:
            try:
                # Try to extract JSON from AI response
                start_idx = ai_response.find('{')
                end_idx = ai_response.rfind('}') + 1
                
                if start_idx != -1 and end_idx != -1:
                    json_str = ai_response[start_idx:end_idx]
                    result = json.loads(json_str)
                    return result
            except Exception as e:
                print(f"Error parsing AI resource response: {e}")
        
        # Fallback to static resources
        print("📚 Using enhanced static learning resources")
        return self._create_enhanced_fallback_resources(skills, expertise, limit, topic)
