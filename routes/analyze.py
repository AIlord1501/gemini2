from fastapi import APIRouter, HTTPException, Depends
from models.schemas import AnalyzeRequest, AnalyzeResponse, CareerPath, RoadmapStep, Course, User
from services.ai_service import AIService
from dependencies import get_current_user
from typing import Optional

router = APIRouter(tags=["analyze"])
ai_service = AIService()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_career_paths(
    request: AnalyzeRequest,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Analyze skills and expertise to generate career paths, roadmap, and courses.
    Can be used with or without authentication.
    """
    try:
        # Use skills and expertise from request or user profile
        skills = request.skills or (current_user.skills if current_user else "")
        expertise = request.expertise or (current_user.expertise if current_user else "")
        
        if not skills or not expertise:
            raise HTTPException(
                status_code=400, 
                detail="Skills and expertise are required. Please provide them in the request or update your profile."
            )
        
        # Generate analysis using Vertex AI
        analysis = ai_service.generate_career_analysis(skills, expertise)
        
        # Convert to Pydantic models
        career_paths = [CareerPath(**path) for path in analysis["career_paths"]]
        selected_path = CareerPath(**analysis["selected_path"])
        roadmap = [RoadmapStep(**step) for step in analysis["roadmap"]]
        courses = [Course(**course) for course in analysis["courses"]]
        
        return AnalyzeResponse(
            career_paths=career_paths,
            selected_path=selected_path,
            roadmap=roadmap,
            courses=courses
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing career paths: {str(e)}")
