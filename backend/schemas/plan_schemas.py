from marshmallow import Schema, fields, validate

class SkillCreateSchema(Schema):
    """Schema for validating new skill plan creation requests."""
    title = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    difficulty = fields.Str(validate=validate.OneOf(["beginner", "intermediate", "advanced"]))
    custom_duration = fields.Int(validate=validate.Range(min=7, max=90))

class HabitCreateSchema(Schema):
    """Schema for validating new habit plan creation requests."""
    title = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    category = fields.Str(required=True, validate=validate.OneOf(["health", "productivity", "learning", "creative", "social"]))
    frequency = fields.Str(validate=validate.OneOf(["daily", "weekly", "custom"]))
    target_days = fields.List(fields.Int(validate=validate.Range(min=0, max=6)))
    target_streak = fields.Int(validate=validate.Range(min=1))

class HabitCheckinSchema(Schema):
    """Schema for validating habit check-in requests."""
    completion_date = fields.Date()
    quality_rating = fields.Int(validate=validate.Range(min=1, max=5))
    notes = fields.Str(validate=validate.Length(max=500))
    duration_actual = fields.Int(validate=validate.Range(min=1)) 