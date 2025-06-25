from bson import ObjectId
from pymongo.results import InsertOneResult, UpdateResult, DeleteResult
from datetime import datetime

class HabitRepository:
    def __init__(self, db_collection):
        self.collection = db_collection

    async def create(self, habit_data: dict) -> dict:

        result: InsertOneResult = self.collection.insert_one(habit_data)
        return self.collection.find_one({"_id": result.inserted_id})

    async def find_by_user(self, user_id: str) -> list:
        return list(self.collection.find({"user_id": user_id}))

    async def find_by_id(self, habit_id: str, user_id: str) -> dict:
        return self.collection.find_one({
            "_id": ObjectId(habit_id), 
            "user_id": user_id
        })

    async def update_streaks(self, habit_id: str, user_id: str, streak_data: dict) -> UpdateResult:
        return self.collection.update_one(
            {"_id": ObjectId(habit_id), "user_id": user_id},
            {"$set": {"streaks": streak_data, "updated_at": datetime.utcnow()}}
        )

    async def delete_by_id(self, habit_id: str, user_id: str) -> DeleteResult:
        return self.collection.delete_one({
            "_id": ObjectId(habit_id), 
            "user_id": user_id
        })

    async def get_by_id(self, habit_id):
        pass

    async def get_by_id_and_user(self, habit_id, user_id):
        pass

    async def update(self, habit):
        pass 