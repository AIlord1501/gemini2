from fastapi import APIRouter, HTTPException
from models.schemas import UpdateSkillsRequest, UpdateSkillsResponse, SkillExtraction, UserUpdate
from services.ai_service import AIService
from services.mock_user_service import user_service
from typing import List

router = APIRouter(tags=["skills"])
ai_service = AIService()

@router.post("/update-skills", response_model=UpdateSkillsResponse)
async def update_skills(request: UpdateSkillsRequest):
    """
    Extract skills from message using Vertex AI and merge into user's Firestore document
    """
    try:
        # Get current user
        user = await user_service.get_user_by_id(request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Extract skills using Vertex AI
        extraction_result = ai_service.extract_skills_with_levels(request.message)
        extracted_skills_data = extraction_result.get("extracted_skills", [])
        
        # Convert to Pydantic models
        extracted_skills = [SkillExtraction(**skill_data) for skill_data in extracted_skills_data]
        
        # Merge with existing skills
        current_skills = user.skills if user.skills else ""
        existing_skills_list = [skill.strip() for skill in current_skills.split(",") if skill.strip()] if current_skills else []
        
        # Create updated skills list
        new_skills = [skill.skill for skill in extracted_skills]
        
        # Merge and deduplicate skills (case-insensitive)
        existing_skills_lower = [skill.lower() for skill in existing_skills_list]
        for new_skill in new_skills:
            if new_skill.lower() not in existing_skills_lower:
                existing_skills_list.append(new_skill)
                existing_skills_lower.append(new_skill.lower())
        
        # Update user skills in database
        updated_skills_string = ", ".join(existing_skills_list)
        user_update = UserUpdate(skills=updated_skills_string)
        updated_user = await user_service.update_user(request.user_id, user_update)
        
        if not updated_user:
            raise HTTPException(status_code=500, detail="Failed to update user skills")
        
        return UpdateSkillsResponse(
            extracted_skills=extracted_skills,
            updated_skills_list=existing_skills_list,
            user=updated_user
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error updating skills: {str(e)}"
        )