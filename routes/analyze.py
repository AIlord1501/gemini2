from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeRequest, AnalyzeResponse, CareerPath, RoadmapStep, Course
from services.ai_service import AIService

router = APIRouter(prefix="/analyze", tags=["analyze"])
ai_service = AIService()

@router.post("", response_model=AnalyzeResponse)
async def analyze_career_paths(request: AnalyzeRequest):
    """
    Analyze skills and expertise to generate career paths, roadmap, and courses
    """
    try:
        # Generate analysis using Vertex AI
        analysis = ai_service.generate_career_analysis(request.skills, request.expertise)
        
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
