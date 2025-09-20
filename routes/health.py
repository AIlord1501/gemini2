from fastapi import APIRouter
from models.schemas import HealthResponse, RootResponse

router = APIRouter(tags=["health"])

@router.get("/", response_model=RootResponse)
async def root():
    """Health check endpoint"""
    return RootResponse(message="Career Path Analyzer API is running")

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(status="healthy", service="career-analyzer")
