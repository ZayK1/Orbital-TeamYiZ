from typing import Dict, Any
from datetime import datetime, date, timedelta
from backend.repositories.habit_repository import HabitRepository
from backend.repositories.checkin_repository import CheckinRepository
from backend.services.ai_service import AIService
import logging
from flask import g
from backend.services.unsplash_service import UnsplashService

class HabitService:
    @staticmethod
    async def create_habit(
        user_id: str,
        title: str,
        category: str,
        color: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        reminder_time: Any = None,
        custom_days: list | None = None
    ) -> Dict[str, Any]:
        habit_repo = HabitRepository(g.db.habits)

        now = datetime.utcnow()

        # Validate dates
        if start_date and end_date and end_date < start_date:
            raise ValueError("End date cannot be before start date.")

        # Validate reminder_time (should be a time object or None)
        if reminder_time and hasattr(reminder_time, 'isoformat'):
            reminder_time_val = reminder_time.isoformat()
        else:
            reminder_time_val = None

        # Use custom_days if provided, else default to all days
        target_days = custom_days if custom_days else [1, 2, 3, 4, 5, 6, 7]

        # Convert start_date and end_date to datetime.datetime for MongoDB compatibility
        start_date_dt = datetime.combine(start_date, datetime.min.time()) if start_date else None
        end_date_dt = datetime.combine(end_date, datetime.min.time()) if end_date else None

        habit_plan_data = {
            "user_id": user_id,
            "title": title,
            "category": category,
            "pattern": {
                "target_days": target_days,
                "reminder_time": reminder_time_val
            },
            "streaks": {
                "current_streak": 0,
                "longest_streak": 0,
                "total_completions": 0
            },
            "goals": {
                "target_streak": 30,
                "weekly_target": 7,
                "monthly_target": 30
            },
            "status": "active",
            "icon_url": None,
            "color": color,
            "created_at": now,
            "updated_at": now,
            "start_date": start_date_dt,
            "end_date": end_date_dt
        }

        try:
            habit_plan_data["icon_url"] = await UnsplashService.fetch_image(category or title)
        except Exception as e:
            logging.error(f"Unsplash fetch failed for habit '{title}': {e}")

        try:
            created_plan_dict = await habit_repo.create(habit_plan_data)
        except Exception as e:
            logging.error(f"Failed to save habit plan for user {user_id}: {e}")
            raise
        
        if created_plan_dict and '_id' in created_plan_dict:
            created_plan_dict['_id'] = str(created_plan_dict['_id'])

        return created_plan_dict

    @staticmethod
    async def get_user_habits(user_id: str) -> list:
        repository = HabitRepository(g.db.habits)
        habits = await repository.find_by_user(user_id)
        for habit in habits:
            habit['_id'] = str(habit['_id'])
        return habits

    @staticmethod
    async def get_habit_by_id(habit_id: str, user_id: str) -> dict:
        repository = HabitRepository(g.db.habits)
        habit = await repository.find_by_id(habit_id, user_id)
        if not habit:
            raise ValueError("Habit not found or access denied")
        habit['_id'] = str(habit['_id'])
        return habit

    @staticmethod
    async def record_checkin(habit_id: str, user_id: str, checkin_data: dict) -> dict:
        
        habit_repo = HabitRepository(g.db.habits)
        checkin_repo = CheckinRepository(g.db.habit_checkins)

        habit = await habit_repo.find_by_id(habit_id, user_id)
        if not habit:
            raise ValueError("Habit not found or access denied")

        if checkin_data['date'].date() > date.today():
            raise ValueError("Cannot log check-ins for a future date.")

        full_checkin_data = {
            "habit_id": habit_id,
            "user_id": user_id,
            **checkin_data,
            "created_at": datetime.utcnow()
        }
        
        created_checkin = await checkin_repo.create_or_update(full_checkin_data)

        updated_streaks = await HabitService._recalculate_streaks(habit_id, user_id)

        await habit_repo.update_streaks(habit_id, user_id, updated_streaks)

        return {
            "checkin": created_checkin,
            "updated_streaks": updated_streaks
        }

    @staticmethod
    async def _recalculate_streaks(habit_id: str, user_id: str) -> dict:
        
        checkin_repo = CheckinRepository(g.db.habit_checkins)
        
        checkins = await checkin_repo.find_completed_by_habit(habit_id, user_id)

        if not checkins:
            return {"current_streak": 0, "longest_streak": 0, "total_completions": 0}

        total_completions = len(checkins)
        
        current_streak = 0
        longest_streak = 0
        
        today = date.today()
        
        checkin_dates = {c['date'].date() for c in checkins}

        streak_today = today
        temp_current_streak = 0
        if streak_today in checkin_dates:
            temp_current_streak += 1
            streak_today -= timedelta(days=1)
        
        while streak_today in checkin_dates:
            temp_current_streak += 1
            streak_today -= timedelta(days=1)
        
        current_streak = temp_current_streak

        if not checkin_dates:
            longest_streak = current_streak
        else:
            sorted_dates = sorted(list(checkin_dates), reverse=True)
            
            if not sorted_dates:
                 longest_streak = 0
            else:
                max_streak = 0
                if len(sorted_dates) > 0:
                    current_max = 1
                    max_streak = 1
                    for i in range(1, len(sorted_dates)):
                        if (sorted_dates[i-1] - sorted_dates[i]).days == 1:
                            current_max +=1
                        else:
                            current_max = 1
                        if current_max > max_streak:
                            max_streak = current_max
                longest_streak = max_streak
        
        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "total_completions": total_completions
        }

    @staticmethod
    async def delete_habit(habit_id: str, user_id: str) -> bool:
        habit_repo = HabitRepository(g.db.habits)
        checkin_repo = CheckinRepository(g.db.habit_checkins)
        
        if not await habit_repo.find_by_id(habit_id, user_id):
            raise ValueError("Habit not found or access denied")
        
        await checkin_repo.delete_by_habit_id(habit_id, user_id)
        
        result = await habit_repo.delete_by_id(habit_id, user_id)
        return result.deleted_count > 0 