#!/usr/bin/env python3
"""
MongoDB Index Initialization Script for Social Features

This script creates the necessary indexes for optimal performance 
of the YiZ Planner social media features.

Run this script after setting up the social features to ensure
proper database performance.

Usage:
    python backend/init_social_indexes.py

Make sure your MONGO_URI environment variable is set properly.
"""

import os
import sys
from pymongo import MongoClient, TEXT, ASCENDING, DESCENDING
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_social_indexes():
    """Create indexes for social features collections"""
    
    # Connect to MongoDB
    mongo_uri = os.getenv('MONGO_URI')
    if not mongo_uri:
        print("❌ Error: MONGO_URI environment variable not set")
        sys.exit(1)
    
    try:
        client = MongoClient(mongo_uri)
        db = client.get_default_database()
        print(f"✅ Connected to MongoDB: {db.name}")
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        sys.exit(1)
    
    # Create indexes for shared_skills collection
    print("\n📚 Creating indexes for shared_skills collection...")
    shared_skills = db.shared_skills
    
    try:
        # Text search index for title and description
        shared_skills.create_index([("title", TEXT), ("description", TEXT)], 
                                 name="text_search_idx")
        print("  ✅ Text search index created")
        
        # Category and popularity index
        shared_skills.create_index([("category", ASCENDING), ("likes_count", DESCENDING)], 
                                 name="category_popularity_idx")
        print("  ✅ Category popularity index created")
        
        # Difficulty and rating index
        shared_skills.create_index([("difficulty", ASCENDING), ("rating.average", DESCENDING)], 
                                 name="difficulty_rating_idx")
        print("  ✅ Difficulty rating index created")
        
        # Trending (recent activity) index
        shared_skills.create_index([("created_at", DESCENDING)], 
                                 name="recent_activity_idx")
        print("  ✅ Recent activity index created")
        
        # Visibility and custom tasks index
        shared_skills.create_index([("visibility", ASCENDING), ("has_custom_tasks", ASCENDING)], 
                                 name="visibility_custom_tasks_idx")
        print("  ✅ Visibility and custom tasks index created")
        
        # User's shared skills index
        shared_skills.create_index([("shared_by", ASCENDING), ("created_at", DESCENDING)], 
                                 name="user_shared_skills_idx")
        print("  ✅ User shared skills index created")
        
    except Exception as e:
        print(f"  ❌ Error creating shared_skills indexes: {e}")
    
    # Create indexes for custom_tasks collection
    print("\n📝 Creating indexes for custom_tasks collection...")
    custom_tasks = db.custom_tasks
    
    try:
        # Skill and day index (most common query)
        custom_tasks.create_index([("skill_id", ASCENDING), ("day", ASCENDING)], 
                                name="skill_day_idx")
        print("  ✅ Skill and day index created")
        
        # User tasks index
        custom_tasks.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)], 
                                name="user_tasks_idx")
        print("  ✅ User tasks index created")
        
        # Popular tasks index (voting)
        custom_tasks.create_index([("votes.up", DESCENDING), ("votes.down", ASCENDING)], 
                                name="task_popularity_idx")
        print("  ✅ Task popularity index created")
        
        # Unique constraint: one custom task per user per skill per day
        custom_tasks.create_index([("skill_id", ASCENDING), ("day", ASCENDING), ("user_id", ASCENDING)], 
                                unique=True, name="unique_user_task_per_day")
        print("  ✅ Unique user task per day constraint created")
        
    except Exception as e:
        print(f"  ❌ Error creating custom_tasks indexes: {e}")
    
    # Create indexes for plan_interactions collection
    print("\n👍 Creating indexes for plan_interactions collection...")
    plan_interactions = db.plan_interactions
    
    try:
        # Unique interaction constraint
        plan_interactions.create_index([("user_id", ASCENDING), ("plan_id", ASCENDING), ("interaction_type", ASCENDING)], 
                                     unique=True, name="unique_user_interaction")
        print("  ✅ Unique user interaction constraint created")
        
        # Plan interactions index
        plan_interactions.create_index([("plan_id", ASCENDING), ("interaction_type", ASCENDING)], 
                                     name="plan_interactions_idx")
        print("  ✅ Plan interactions index created")
        
        # User interactions index
        plan_interactions.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)], 
                                     name="user_interactions_idx")
        print("  ✅ User interactions index created")
        
        # Recent interactions for trending
        plan_interactions.create_index([("interaction_type", ASCENDING), ("created_at", DESCENDING)], 
                                     name="recent_interactions_idx")
        print("  ✅ Recent interactions index created")
        
    except Exception as e:
        print(f"  ❌ Error creating plan_interactions indexes: {e}")
    
    # Create indexes for plan_comments collection
    print("\n💬 Creating indexes for plan_comments collection...")
    plan_comments = db.plan_comments
    
    try:
        # Plan comments index (chronological)
        plan_comments.create_index([("plan_id", ASCENDING), ("created_at", ASCENDING)], 
                                 name="plan_comments_chrono_idx")
        print("  ✅ Plan comments chronological index created")
        
        # User comments index
        plan_comments.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)], 
                                 name="user_comments_idx")
        print("  ✅ User comments index created")
        
        # Parent comment index for threading
        plan_comments.create_index([("parent_comment_id", ASCENDING)], 
                                 name="comment_threading_idx")
        print("  ✅ Comment threading index created")
        
        # Popular comments index
        plan_comments.create_index([("likes_count", DESCENDING), ("created_at", DESCENDING)], 
                                 name="popular_comments_idx")
        print("  ✅ Popular comments index created")
        
    except Exception as e:
        print(f"  ❌ Error creating plan_comments indexes: {e}")
    
    print("\n🎉 Social features indexes creation completed!")
    print("\n📋 Summary of created collections and indexes:")
    print("  📚 shared_skills: 6 indexes (text search, category, difficulty, trending, visibility, user)")
    print("  📝 custom_tasks: 4 indexes (skill-day, user, popularity, uniqueness)")
    print("  👍 plan_interactions: 4 indexes (uniqueness, plan, user, trending)")
    print("  💬 plan_comments: 4 indexes (plan-chrono, user, threading, popularity)")
    
    # Verify indexes were created
    print("\n🔍 Verifying indexes...")
    collections_to_check = ['shared_skills', 'custom_tasks', 'plan_interactions', 'plan_comments']
    
    for collection_name in collections_to_check:
        collection = db[collection_name]
        indexes = list(collection.list_indexes())
        print(f"  {collection_name}: {len(indexes)} indexes total")
    
    client.close()
    print("\n✅ All done! Your social features are ready for optimal performance.")

if __name__ == "__main__":
    print("🚀 YiZ Planner Social Features - Database Index Setup")
    print("=" * 60)
    create_social_indexes()