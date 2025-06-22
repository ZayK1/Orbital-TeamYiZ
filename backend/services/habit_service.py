# backend/services/habit_service.py
from typing import List, Optional, Dict, Any, cast
from datetime import datetime, date, timedelta
from backend.models.base import HabitPlan
from backend.repositories.habit_repository import HabitRepository
from backend.repositories.checkin_repository import CheckinRepository

class HabitService:
    def __init__(self, habit_repo: HabitRepository, checkin_repo: CheckinRepository):
        self.habit_repo = habit_repo
        self.checkin_repo = checkin_repo
    
    async def create_habit_plan(
        self,
        user_id: str,
        title: str,
        category: str,
        frequency: str = "daily",
        target_days: Optional[List[int]] = None,
        target_streak: Optional[int] = None
    ) -> HabitPlan:
        
        if target_days is None:
            target_days = list(range(7))
        
        habit_data = {
            "user_id": user_id,
            "title": title,
            "category": category,
            "pattern": {
                "frequency": frequency,
                "target_days": target_days,
                "target_time": None,
                "duration_minutes": 15
            },
            "streaks": {
                "current_streak": 0,
                "longest_streak": 0,
                "total_completions": 0,
                "success_rate_30d": 0,
                "last_completion": None
            },
            "goals": {
                "target_streak": target_streak,
                "milestone_rewards": self._generate_default_milestones(target_streak)
            },
            "status": "active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        return cast(HabitPlan, await self.habit_repo.create(habit_data))
    
    async def record_checkin(
        self,
        user_id: str,
        habit_id: str,
        completion_date: date,
        quality_rating: Optional[int] = None,
        notes: Optional[str] = None,
        duration_actual: Optional[int] = None
    ) -> Dict[str, Any]:
        
        habit = cast(HabitPlan, await self.habit_repo.get_by_id_and_user(habit_id, user_id))
        if not habit:
            raise ValueError("Habit not found or access denied")
        
        checkin_data = {
            "habit_id": habit_id,
            "user_id": user_id,
            "date": completion_date,
            "completed": True,
            "quality_rating": quality_rating,
            "notes": notes,
            "duration_actual": duration_actual,
            "created_at": datetime.utcnow()
        }
        
        checkin = await self.checkin_repo.upsert_by_date(checkin_data)
        
        await self._update_habit_statistics(habit)
        
        return {
            "checkin": checkin,
            "habit": habit,
            "streak_updated": True
        }
    
    async def _update_habit_statistics(self, habit: HabitPlan) -> HabitPlan:
        
        recent_checkins = cast(List[Any], await self.checkin_repo.get_recent_for_habit(
            habit.id, # type: ignore
            days=90
        ))
        
        current_streak = self._calculate_current_streak(recent_checkins, habit.pattern)
        
        thirty_day_checkins = [c for c in recent_checkins if c.date >= date.today() - timedelta(days=30)]
        success_rate_30d = self._calculate_success_rate(thirty_day_checkins, habit.pattern, 30)
        
        habit.streaks.update({
            "current_streak": current_streak,
            "longest_streak": max(habit.streaks.get("longest_streak", 0), current_streak),
            "total_completions": len([c for c in recent_checkins if c.completed]),
            "success_rate_30d": success_rate_30d,
            "last_completion": recent_checkins[0].date if recent_checkins else None
        })
        
        self._check_milestone_achievements(habit)
        
        habit.updated_at = datetime.utcnow()
        return cast(HabitPlan, await self.habit_repo.update(habit))
    
    def _generate_default_milestones(self, target_streak: Optional[int]) -> List[Dict]:
        milestones = [
            {"days": 7, "reward": "First Week Champion! 🎉", "achieved": False},
            {"days": 21, "reward": "Habit Formation Master! 🏆", "achieved": False},
            {"days": 30, "reward": "Monthly Consistency King! 👑", "achieved": False},
            {"days": 66, "reward": "Habit Automation Expert! 🤖", "achieved": False},
            {"days": 100, "reward": "Century Club Member! 💯", "achieved": False}
        ]
        
        if target_streak and target_streak not in [m["days"] for m in milestones]:
            milestones.append({
                "days": target_streak,
                "reward": f"Personal Goal Achieved! 🎯",
                "achieved": False
            })
        
        return sorted(milestones, key=lambda x: x["days"])

    def _calculate_current_streak(self, recent_checkins: List[Any], pattern: Dict[str, Any]) -> int:
        return 0

    def _calculate_success_rate(self, checkins: List[Any], pattern: Dict[str, Any], days: int) -> float:
        # Placeholder for success rate calculation.
        return 0.0

    def _check_milestone_achievements(self, habit: HabitPlan) -> None:
        # Placeholder for milestone logic.
        pass 