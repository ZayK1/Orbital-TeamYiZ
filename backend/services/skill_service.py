from typing import List, Optional, Dict, Any, cast
from datetime import datetime, timedelta
from backend.models.base import SkillPlan
from backend.repositories.skill_repository import SkillRepository
from backend.services.ai_service import AIService

class SkillService:
    def __init__(self, repository: SkillRepository, ai_service: AIService):
        self.repository = repository
        self.ai_service = ai_service
    
    async def create_skill_plan(
        self, 
        user_id: str, 
        title: str, 
        skill_name: str, 
        difficulty: str = "beginner",
        custom_duration: int = 30
    ) -> SkillPlan:
        curriculum = await self.ai_service.generate_skill_curriculum(
            skill_name=skill_name,
            difficulty=difficulty,
            duration_days=custom_duration
        )
        
        projected_completion = datetime.utcnow() + timedelta(days=custom_duration)
        
        skill_data = {
            "user_id": user_id,
            "title": title,
            "skill_name": skill_name,
            "difficulty": difficulty,
            "curriculum": curriculum,
            "progress": {
                "current_day": 1,
                "completed_days": 0,
                "completion_percentage": 0,
                "started_at": datetime.utcnow(),
                "last_activity": datetime.utcnow(),
                "projected_completion": projected_completion
            },
            "status": "active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        return cast(SkillPlan, await self.repository.create(skill_data))
    
    async def mark_day_complete(
        self, 
        user_id: str, 
        skill_id: str, 
        day_number: int
    ) -> SkillPlan:
        
        skill = cast(SkillPlan, await self.repository.get_by_id_and_user(skill_id, user_id))
        if not skill:
            raise ValueError("Skill not found or access denied")
        
        for day in skill.curriculum["days"]:
            if day["day_number"] == day_number:
                if not day.get("completed", False):
                    day["completed"] = True
                    day["completed_at"] = datetime.utcnow()
                    break
        
        completed_days = sum(1 for day in skill.curriculum["days"] if day.get("completed", False))
        total_days = skill.curriculum["total_days"]
        
        skill.progress.update({
            "completed_days": completed_days,
            "completion_percentage": (completed_days / total_days) * 100,
            "current_day": min(day_number + 1, total_days),
            "last_activity": datetime.utcnow()
        })
        
        if completed_days >= total_days:
            skill.status = "completed"
        
        skill.updated_at = datetime.utcnow()
        
        return cast(SkillPlan, await self.repository.update(skill))
    
    async def get_user_skills(
        self, 
        user_id: str, 
        status: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict[str, Any]:
        
        return cast(Dict[str, Any], await self.repository.get_by_user_paginated(
            user_id=user_id,
            status=status,
            page=page,
            limit=limit
        )) 