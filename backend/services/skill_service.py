from typing import List, Optional, Dict, Any, cast
from datetime import datetime, timedelta
from backend.models.base import SkillPlan
from backend.repositories.skill_repository import SkillRepository
from backend.services.ai_service import AIService
import logging
from flask import g
from bson import ObjectId
from backend.services.unsplash_service import UnsplashService

class SkillService:
    @staticmethod
    async def create_skill(user_id: str, title: str, start_date_str: Optional[str] = None) -> Dict[str, Any]:
     
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


        image_url = None
        try:
            image_url = await UnsplashService.fetch_image(title)
        except Exception as e:
            logging.error(f"Unsplash fetch failed for skill '{title}': {e}")

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
            "image_url": image_url,
            "created_at": now,
            "updated_at": now
        }

        try:
            created_plan_dict = await skill_repo.create(skill_plan_data)
        except Exception as e:
            logging.error(f"Failed to save skill plan for user {user_id}: {e}")
            raise
        
        if created_plan_dict and '_id' in created_plan_dict:
            created_plan_dict['_id'] = str(created_plan_dict['_id'])
            
        return created_plan_dict
    
    @staticmethod
    async def get_user_skills(user_id: str) -> list:
        repository = SkillRepository(g.db.skills)
        skills = await repository.find_by_user(user_id)
        for skill in skills:
            skill['_id'] = str(skill['_id'])
        return skills

    @staticmethod
    async def get_skill_by_id(skill_id: str, user_id: str) -> dict:
        repository = SkillRepository(g.db.skills)
        skill = await repository.find_by_id(skill_id, user_id)
        if not skill:
            raise ValueError("Skill not found or access denied")
        skill['_id'] = str(skill['_id'])
        return skill

    @staticmethod
    async def complete_skill_day(skill_id: str, user_id: str, day_number: int) -> dict:
        repository = SkillRepository(g.db.skills)
        skill = await repository.find_by_id(skill_id, user_id)
        
        if not skill:
            raise ValueError("Skill not found or access denied")
        if not (1 <= day_number <= 30):
            raise ValueError("Day number must be between 1 and 30")

        daily_tasks = skill.get('curriculum', {}).get('daily_tasks', [])
        if not (0 <= day_number - 1 < len(daily_tasks)):
            raise ValueError("Invalid day number for the curriculum")

        if daily_tasks[day_number - 1].get('completed', False):
            raise ValueError("Day is already completed")
        
        await repository.update_day_completion(skill_id, user_id, day_number)
        
        completed_days = skill.get('progress', {}).get('completed_days', 0) + 1
        
        progress_data = {
            "completed_days": completed_days,
            "completion_percentage": round((completed_days / 30) * 100, 2),
            "current_day": min(day_number + 1, 30),
            "last_accessed": datetime.utcnow()
        }
        await repository.update_progress_stats(skill_id, user_id, progress_data)
        return progress_data

    @staticmethod
    async def delete_skill(skill_id: str, user_id: str) -> bool:
        repository = SkillRepository(g.db.skills)
        if not await repository.find_by_id(skill_id, user_id):
            raise ValueError("Skill not found or access denied")
        result = await repository.delete_by_id(skill_id, user_id)
        return result.deleted_count > 0 