# backend/repositories/skill_repository.py

from bson import ObjectId
from pymongo.results import InsertOneResult

class SkillRepository:
    """
    Handles all database operations related to the 'skills' collection.
    """
    def __init__(self, db_collection):
        self.collection = db_collection
    
    async def create(self, skill_data: dict) -> dict:
        """
        Inserts a new skill document into the database.
        """
        result: InsertOneResult = self.collection.insert_one(skill_data)
        created_document = self.collection.find_one({"_id": result.inserted_id})
        return created_document

    async def get_by_id_and_user(self, skill_id: str, user_id: str):
        # Placeholder for fetching a skill by its ID for a specific user.
        return self.collection.find_one({"_id": ObjectId(skill_id), "user_id": user_id})

    async def update(self, skill):
        # Placeholder for updating a skill document.
        pass

    async def get_by_user_paginated(self, user_id, status, page, limit):
        # Placeholder for fetching a paginated list of skills for a user.
        pass 