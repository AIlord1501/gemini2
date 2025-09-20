import json
import os
from typing import Dict, Any
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel
from models.schemas import CareerPath, Course, RoadmapStep

class AIService:
    """Service for handling AI-related operations using Vertex AI"""
    
    def __init__(self):
        """Initialize the AI service with Vertex AI"""
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "your-project-id")
        aiplatform.init(project=self.project_id)
        self.model = GenerativeModel("gemini-1.0-pro")
    
    def generate_career_analysis(self, skills: str, expertise: str) -> Dict[str, Any]:
        """Generate career analysis using Vertex AI Gemini model"""
        
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

        try:
            response = self.model.generate_content(prompt)
            
            # Extract JSON from response
            response_text = response.text
            
            # Try to find JSON in the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                # Fallback if JSON parsing fails
                return self._create_fallback_response(skills, expertise)
                
        except Exception as e:
            print(f"Error generating content: {e}")
            return self._create_fallback_response(skills, expertise)
    
    def _create_fallback_response(self, skills: str, expertise: str) -> Dict[str, Any]:
        """Create a fallback response when AI generation fails"""
        return {
            "career_paths": [
                {
                    "title": "Software Developer",
                    "description": "Develop and maintain software applications",
                    "required_skills": ["Programming", "Problem Solving", "Teamwork"],
                    "salary_range": "$60,000 - $120,000",
                    "growth_prospect": "High - Growing demand for software developers"
                },
                {
                    "title": "Data Analyst",
                    "description": "Analyze data to help organizations make decisions",
                    "required_skills": ["Data Analysis", "Statistics", "Communication"],
                    "salary_range": "$50,000 - $90,000",
                    "growth_prospect": "High - Data-driven decision making is crucial"
                },
                {
                    "title": "Project Manager",
                    "description": "Plan and execute projects within organizations",
                    "required_skills": ["Leadership", "Organization", "Communication"],
                    "salary_range": "$55,000 - $100,000",
                    "growth_prospect": "Medium - Steady demand across industries"
                }
            ],
            "selected_path": {
                "title": "Software Developer",
                "description": "Develop and maintain software applications using various programming languages and frameworks",
                "required_skills": ["Programming", "Problem Solving", "Teamwork", "Version Control"],
                "salary_range": "$60,000 - $120,000",
                "growth_prospect": "High - Growing demand for software developers"
            },
            "roadmap": [
                {
                    "step": 1,
                    "title": "Learn Programming Fundamentals",
                    "description": "Master basic programming concepts and choose a primary language",
                    "duration": "3-6 months",
                    "resources": ["Online tutorials", "Programming books", "Practice projects"]
                },
                {
                    "step": 2,
                    "title": "Build Projects",
                    "description": "Create portfolio projects to demonstrate your skills",
                    "duration": "2-4 months",
                    "resources": ["GitHub", "Portfolio website", "Code reviews"]
                },
                {
                    "step": 3,
                    "title": "Learn Frameworks and Tools",
                    "description": "Master relevant frameworks and development tools",
                    "duration": "2-3 months",
                    "resources": ["Framework documentation", "Tutorials", "Practice"]
                },
                {
                    "step": 4,
                    "title": "Contribute to Open Source",
                    "description": "Participate in open source projects to gain experience",
                    "duration": "Ongoing",
                    "resources": ["GitHub", "Open source communities", "Code reviews"]
                },
                {
                    "step": 5,
                    "title": "Apply for Jobs",
                    "description": "Prepare resume, practice interviews, and apply for positions",
                    "duration": "1-3 months",
                    "resources": ["Job boards", "Networking", "Interview preparation"]
                }
            ],
            "courses": [
                {
                    "title": "Complete Web Development Bootcamp",
                    "provider": "Udemy",
                    "duration": "12 weeks",
                    "difficulty": "Beginner",
                    "url": "https://www.udemy.com/course/the-complete-web-development-bootcamp/"
                },
                {
                    "title": "Python for Everybody",
                    "provider": "Coursera",
                    "duration": "8 weeks",
                    "difficulty": "Beginner",
                    "url": "https://www.coursera.org/specializations/python"
                },
                {
                    "title": "JavaScript Algorithms and Data Structures",
                    "provider": "freeCodeCamp",
                    "duration": "6 weeks",
                    "difficulty": "Intermediate",
                    "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"
                },
                {
                    "title": "React Development",
                    "provider": "Codecademy",
                    "duration": "10 weeks",
                    "difficulty": "Intermediate",
                    "url": "https://www.codecademy.com/learn/react-101"
                },
                {
                    "title": "System Design Interview",
                    "provider": "Educative",
                    "duration": "4 weeks",
                    "difficulty": "Advanced",
                    "url": "https://www.educative.io/courses/grokking-the-system-design-interview"
                }
            ]
        }
