from flask import Blueprint, request, jsonify, g
from marshmallow import ValidationError
from typing import cast
from datetime import datetime
from backend.auth.routes import require_auth
from backend.schemas.plan_schemas import SkillCreateSchema, HabitCreateSchema, CheckinCreateSchema
from backend.services.skill_service import SkillService
from backend.services.habit_service import HabitService
v1_plans_blueprint = Blueprint('plans', __name__)



@v1_plans_blueprint.errorhandler(ValidationError)
def handle_marshmallow_validation(err):
    return jsonify({"error": "Validation failed", "details": err.messages}), 422

@v1_plans_blueprint.errorhandler(ValueError)
def handle_value_error(err):
    return jsonify({"error": str(err)}), 400

@v1_plans_blueprint.errorhandler(Exception)
def handle_generic_error(err):
    return jsonify({"error": "An unexpected error occurred."}), 500


@v1_plans_blueprint.route('/', methods=['GET'])
@require_auth
def get_all_plans():
    user_id = str(g.current_user['_id'])
    skills = SkillService.get_user_skills(user_id)
    habits = HabitService.get_user_habits(user_id)
    return jsonify({"skills": skills, "habits": habits}), 200



@v1_plans_blueprint.route('/skills', methods=['POST'])
@require_auth
def create_skill():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "Invalid JSON"}), 400
    
    validated_data = cast(dict, SkillCreateSchema().load(json_data))
    user_id = str(g.current_user['_id'])
    
    skill_plan = SkillService.create_skill(user_id=user_id, title=validated_data['skill_name'])
    return jsonify({"message": "Skill plan created successfully", "skill": skill_plan}), 201

@v1_plans_blueprint.route('/skills/<skill_id>', methods=['GET'])
@require_auth
def get_skill(skill_id: str):
    user_id = str(g.current_user['_id'])
    skill = SkillService.get_skill_by_id(skill_id, user_id)
    return jsonify(skill), 200

@v1_plans_blueprint.route('/skills/<skill_id>', methods=['DELETE'])
@require_auth
def delete_skill(skill_id: str):
    user_id = str(g.current_user['_id'])
    success = SkillService.delete_skill(skill_id, user_id)
    if success:
        return jsonify({"message": "Skill deleted successfully"}), 200
    return jsonify({"error": "Delete operation failed"}), 500


@v1_plans_blueprint.route('/skills/<skill_id>/days/<int:day_number>/complete', methods=['PATCH'])
@require_auth
def complete_skill_day_route(skill_id: str, day_number: int):
    user_id = str(g.current_user['_id'])
    progress = SkillService.complete_skill_day(skill_id, user_id, day_number)
    return jsonify({"message": "Day marked as completed", "progress": progress}), 200


@v1_plans_blueprint.route('/habits', methods=['POST'])
@require_auth
def create_habit():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "Invalid JSON"}), 400

    validated_data = cast(dict, HabitCreateSchema().load(json_data))
    user_id = str(g.current_user['_id'])
    
    habit_plan = HabitService.create_habit(
        user_id=user_id,
        title=validated_data['title'],
        category=validated_data['category'],
        color=validated_data.get('color'),
        start_date=validated_data.get('start_date'),
        end_date=validated_data.get('end_date'),
        reminder_time=validated_data.get('reminder_time'),
        custom_days=validated_data.get('custom_days')
    )
    return jsonify({"message": "Habit created successfully", "habit": habit_plan}), 201

@v1_plans_blueprint.route('/habits/<habit_id>/checkin', methods=['POST'])
@require_auth
def record_habit_checkin(habit_id: str):
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "Invalid JSON"}), 400
    
    validated_data = cast(dict, CheckinCreateSchema().load(json_data))
    user_id = str(g.current_user['_id'])
    
    validated_data['date'] = datetime.combine(validated_data['date'], datetime.min.time())
    
    result = HabitService.record_checkin(habit_id, user_id, validated_data)

    if result and result.get('checkin') and '_id' in result['checkin']:
        result['checkin']['_id'] = str(result['checkin']['_id'])

    return jsonify({
        "message": "Check-in recorded successfully", 
        **result
    }), 201

@v1_plans_blueprint.route('/habits/<habit_id>', methods=['GET'])
@require_auth
def get_habit(habit_id: str):
    user_id = str(g.current_user['_id'])
    habit = HabitService.get_habit_by_id(habit_id, user_id)
    return jsonify(habit), 200

@v1_plans_blueprint.route('/habits/<habit_id>', methods=['DELETE'])
@require_auth
def delete_habit(habit_id: str):
    user_id = str(g.current_user['_id'])
    success = HabitService.delete_habit(habit_id, user_id)
    if success:
        return jsonify({"message": "Habit deleted successfully"}), 200
    return jsonify({"error": "Delete operation failed"}), 500


@v1_plans_blueprint.route('/habits/<habit_id>', methods=['PATCH'])
@require_auth
def update_habit(habit_id: str):
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "Invalid JSON"}), 400

    from backend.schemas.plan_schemas import HabitUpdateSchema
    validated_data = cast(dict, HabitUpdateSchema().load(json_data))
    user_id = str(g.current_user['_id'])

    updated_habit = HabitService.update_habit(habit_id, user_id, validated_data)
    return jsonify({"message": "Habit updated successfully", "habit": updated_habit}), 200