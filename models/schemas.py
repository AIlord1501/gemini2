from pydantic import BaseModel
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    """Request model for career analysis"""
    skills: str
    expertise: str

class CareerPath(BaseModel):
    """Career path information"""
    title: str
    description: str
    required_skills: List[str]
    salary_range: str
    growth_prospect: str

class Course(BaseModel):
    """Course recommendation"""
    title: str
    provider: str
    duration: str
    difficulty: str
    url: str

class RoadmapStep(BaseModel):
    """Roadmap step information"""
    step: int
    title: str
    description: str
    duration: str
    resources: List[str]

class AnalyzeResponse(BaseModel):
    """Complete analysis response"""
    career_paths: List[CareerPath]
    selected_path: CareerPath
    roadmap: List[RoadmapStep]
    courses: List[Course]

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str

class RootResponse(BaseModel):
    """Root endpoint response"""
    message: str
