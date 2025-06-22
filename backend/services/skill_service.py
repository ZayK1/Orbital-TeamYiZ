from typing import List, Optional, Dict, Any, cast
from datetime import datetime, timedelta
from backend.models.base import SkillPlan
from backend.repositories.skill_repository import SkillRepository
from backend.services.ai_service import AIService
import logging
from flask import g

class SkillService:
    def __init__(self, repository: SkillRepository, ai_service: AIService):
        self.repository = repository
        self.ai_service = ai_service
    
    @staticmethod
    async def create_skill(user_id: str, title: str, start_date_str: Optional[str] = None) -> Dict[str, Any]:
        """
        Creates a new skill plan by generating a curriculum from the AI service
        and saving it to the database.
        """
        skill_repo = SkillRepository(g.db.skills)

        try:
            daily_tasks_list = await AIService.generate_structured_plan(topic=title, plan_type="skill")
        except (ValueError, ConnectionError) as e:
            logging.error(f"AI Service failed to generate plan for skill '{title}': {e}")
            raise

        now = datetime.utcnow()
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        if start_date_str:
            try:
                start_date = datetime.fromisoformat(start_date_str)
            except ValueError:
                raise ValueError("Invalid date format. Use YYYY-MM-DD.")

        skill_plan_data = {
            "user_id": user_id,
            "title": title,
            "skill_name": title,
            "difficulty": "beginner",
            "curriculum": {
                "daily_tasks": daily_tasks_list,
                "total_days": 30
            },
            "progress": {
                "current_day": 1,
                "completed_days": 0,
                "completion_percentage": 0,
                "started_at": start_date,
                "last_activity": start_date,
                "projected_completion": start_date + timedelta(days=30)
            },
            "status": "active",
            "created_at": now,
            "updated_at": now
        }

        try:
            created_plan_dict = await skill_repo.create(skill_plan_data)
        except Exception as e:
            logging.error(f"Failed to save skill plan for user {user_id}: {e}")
            raise
        
        return created_plan_dict
    
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

    async def get_skill_plan(self, plan_id: str, user_id: str) -> Optional[SkillPlan]:
        # Implementation of get_skill_plan method
        pass 