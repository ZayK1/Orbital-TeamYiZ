import os
from flask import Blueprint, request, jsonify, g, current_app
from marshmallow import ValidationError
from datetime import date
from typing import cast

from backend.auth.routes import require_auth
from backend.schemas.plan_schemas import SkillCreateSchema, HabitCreateSchema, HabitCheckinSchema
from backend.services.ai_service import AIService
from backend.services.skill_service import SkillService
from backend.services.habit_service import HabitService
from backend.repositories.skill_repository import SkillRepository
from backend.repositories.habit_repository import HabitRepository
from backend.repositories.checkin_repository import CheckinRepository

plans_bp = Blueprint('plans', __name__, url_prefix='/api/v1/plans')

# --- Dependency Injection Factories ---

def get_ai_service():
    """Creates an instance of the AIService."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable not set.")
    return AIService(api_key=api_key)

def get_skill_service():
    """Creates an instance of the SkillService with its dependencies."""
    if 'db' not in g or g.db is None:
        raise ConnectionError("Database not connected.")
    skill_repo = SkillRepository(g.db.skills)
    ai_service = get_ai_service()
    return SkillService(repository=skill_repo, ai_service=ai_service)

def get_habit_service():
    """Creates an instance of the HabitService with its dependencies."""
    if 'db' not in g or g.db is None:
        raise ConnectionError("Database not connected.")
    habit_repo = HabitRepository(g.db.habits)
    checkin_repo = CheckinRepository(g.db.habit_checkins)
    return HabitService(habit_repo=habit_repo, checkin_repo=checkin_repo)

# --- Error Handler ---

@plans_bp.errorhandler(ValidationError)
def handle_marshmallow_validation(err):
    return jsonify({
        "status": "error",
        "message": "Validation error",
        "errors": err.messages
    }), 422

@plans_bp.errorhandler(ValueError)
def handle_value_error(err):
    return jsonify({"status": "error", "message": str(err)}), 400

# --- Skill Routes ---

@plans_bp.route('/skills', methods=['POST']) # type: ignore
@require_auth
async def create_skill():
    """Creates a new skill plan."""
    validated_data = cast(dict, SkillCreateSchema().load(request.json or {}))
    service = get_skill_service()
    
    # g.user_id is set by the @require_auth decorator
    skill = await service.create_skill_plan(user_id=g.user_id, **validated_data)
    
    # The repository returns placeholder data for now, so we can't serialize it.
    # We will return a success message instead.
    return jsonify({
        "status": "success",
        "message": "Skill plan created successfully. NOTE: Data is placeholder.",
        # "data": skill.to_dict() # This will be enabled once repos are implemented
    }), 201

@plans_bp.route('/skills/<skill_id>/days/<int:day_number>/complete', methods=['PATCH']) # type: ignore
@require_auth
async def mark_skill_day_complete(skill_id, day_number):
    """Marks a day of a skill plan as complete."""
    service = get_skill_service()
    skill = await service.mark_day_complete(
        user_id=g.user_id,
        skill_id=skill_id,
        day_number=day_number
    )
    return jsonify({
        "status": "success",
        "message": f"Day {day_number} marked as complete. NOTE: Data is placeholder.",
        # "data": skill.to_dict()
    })

# --- Habit Routes ---

@plans_bp.route('/habits', methods=['POST']) # type: ignore
@require_auth
async def create_habit():
    """Creates a new habit."""
    validated_data = cast(dict, HabitCreateSchema().load(request.json or {}))
    service = get_habit_service()
    habit = await service.create_habit_plan(user_id=g.user_id, **validated_data)
    return jsonify({
        "status": "success",
        "message": "Habit plan created successfully. NOTE: Data is placeholder.",
        # "data": habit.to_dict()
    }), 201

@plans_bp.route('/habits/<habit_id>/checkin', methods=['POST']) # type: ignore
@require_auth
async def habit_checkin(habit_id):
    """Records a check-in for a habit."""
    validated_data = cast(dict, HabitCheckinSchema().load(request.json or {}))
    service = get_habit_service()
    
    # Use 'date.today()' as a fallback if not provided in the request
    completion_date = validated_data.get('completion_date', date.today())
    
    result = await service.record_checkin(
        user_id=g.user_id,
        habit_id=habit_id,
        completion_date=completion_date,
        quality_rating=validated_data.get('quality_rating'),
        notes=validated_data.get('notes'),
        duration_actual=validated_data.get('duration_actual')
    )
    return jsonify({
        "status": "success",
        "data": "Check-in recorded successfully. NOTE: Data is placeholder.",
        # "data": result 
    }) 