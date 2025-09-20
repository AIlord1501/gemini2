from fastapi import APIRouter, HTTPException, Depends
from models.schemas import ChatMessage, ChatResponse, User
from services.ai_service import AIService
from services.mock_user_service import user_service
from dependencies import get_current_user
from typing import Optional

router = APIRouter(prefix="/chat", tags=["chat"])
ai_service = AIService()

@router.post("/update-skills", response_model=ChatResponse)
async def update_skills_via_chat(
    chat_message: ChatMessage,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Update user skills through natural language chat message.
    Uses Vertex AI to extract skills from the message and merge with existing skills.
    """
    try:
        # If user is authenticated, use their skills, otherwise use empty string
        current_skills = current_user.skills if current_user else ""
        user_id = current_user.id if current_user else None
        
        # Extract skills using AI
        skill_data = ai_service.extract_skills_from_message(
            chat_message.message, 
            current_skills
        )
        
        # If user is authenticated and new skills were extracted, update their profile
        updated_user = None
        if current_user and skill_data.get("extracted_skills"):
            try:
                from models.schemas import UserUpdate
                user_update = UserUpdate(skills=skill_data["updated_skills"])
                updated_user = await user_service.update_user(current_user.id, user_update)
            except Exception as e:
                print(f"Error updating user skills: {e}")
                # Continue without updating user, but still return the AI response
        
        return ChatResponse(
            bot_message=skill_data["bot_response"],
            extracted_skills=skill_data["extracted_skills"],
            updated_skills=skill_data["updated_skills"],
            user=updated_user
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing chat message: {str(e)}"
        )