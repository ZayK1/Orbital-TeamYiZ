# backend/repositories/habit_repository.py

from bson import ObjectId
from pymongo.results import InsertOneResult

class HabitRepository:
    """
    Handles all database operations related to the 'habits' collection.
    """
    def __init__(self, db_collection):
        self.collection = db_collection

    async def create(self, habit_data: dict) -> dict:
        """
        Inserts a new habit document into the database.
        """
        result: InsertOneResult = self.collection.insert_one(habit_data)
        created_document = self.collection.find_one({"_id": result.inserted_id})
        return created_document

    async def get_by_id(self, habit_id):
        pass

    async def find_by_user(self, user_id):
        pass

    async def get_by_id_and_user(self, habit_id, user_id):
        # Placeholder
        pass

    async def update(self, habit):
        # Placeholder
        pass 