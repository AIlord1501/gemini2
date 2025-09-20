from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from services.ai_service import AIService
from services.user_service import UserService
import json

router = APIRouter()

class ResourceRequest(BaseModel):
    skills: str
    expertise: str
    limit: int = 5
    topic: Optional[str] = None

class YouTubeCourse(BaseModel):
    title: str
    url: str

class Article(BaseModel):
    title: str
    url: str

class ResourcesResponse(BaseModel):
    youtube_courses: List[YouTubeCourse]
    articles: List[Article]
    resource_id: str
    created_at: str

# Initialize services
ai_service = AIService()
user_service = UserService()

@router.post("/resources", response_model=ResourcesResponse)
async def get_learning_resources(request: ResourceRequest):
    """
    Get personalized learning resources including YouTube courses and articles
    based on user skills and expertise level.
    """
    try:
        # Generate learning resources using AI service
        resources = ai_service.generate_learning_resources(
            skills=request.skills,
            expertise=request.expertise,
            limit=request.limit,
            topic=request.topic
        )
        
        # Generate resource ID
        resource_id = f"resource_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(request.skills + request.expertise) % 10000}"
        
        # Prepare data for Firestore
        resource_data = {
            "resource_id": resource_id,
            "skills": request.skills,
            "expertise": request.expertise,
            "limit": request.limit,
            "topic": request.topic,
            "youtube_courses": [course.dict() if hasattr(course, 'dict') else course for course in resources["youtube_courses"]],
            "articles": [article.dict() if hasattr(article, 'dict') else article for article in resources["articles"]],
            "created_at": datetime.now().isoformat(),
            "timestamp": datetime.now()
        }
        
        # Save to Firestore
        try:
            user_service.save_resource(resource_data)
            print(f"Learning resources saved to Firestore with ID: {resource_id}")
        except Exception as e:
            print(f"Warning: Could not save to Firestore: {e}")
            # Continue without saving - the response is still valid
        
        # Return response
        return ResourcesResponse(
            youtube_courses=[YouTubeCourse(**course) for course in resources["youtube_courses"]],
            articles=[Article(**article) for article in resources["articles"]],
            resource_id=resource_id,
            created_at=resource_data["created_at"]
        )
        
    except Exception as e:
        print(f"Error generating learning resources: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate learning resources: {str(e)}")