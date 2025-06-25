from pymongo.results import DeleteResult
from pymongo import ReturnDocument

class CheckinRepository:
    def __init__(self, db_collection):
        self.collection = db_collection

    async def create_or_update(self, checkin_data: dict) -> dict:

        result = self.collection.find_one_and_update(
            {
                "habit_id": checkin_data["habit_id"],
                "user_id": checkin_data["user_id"],
                "date": checkin_data["date"]
            },
            {"$set": checkin_data},
            upsert=True,
            return_document=ReturnDocument.AFTER
        )
        return result

    async def find_completed_by_habit(self, habit_id: str, user_id: str) -> list:

        return list(self.collection.find({
            "habit_id": habit_id,
            "user_id": user_id,
            "completed": True
        }).sort("date", -1))

    async def delete_by_habit_id(self, habit_id: str, user_id: str) -> DeleteResult:

        return self.collection.delete_many({
            "habit_id": habit_id,
            "user_id": user_id
        })

    async def upsert_by_date(self, checkin_data):
        pass

    async def get_recent_for_habit(self, habit_id, days):
        pass 