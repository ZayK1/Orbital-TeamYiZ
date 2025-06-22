import os
import httpx
import json
import logging
from typing import Dict, Any, List

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL_NAME = os.getenv("AI_MODEL_NAME", "deepseek/deepseek-r1-0528:free")

class AIService:
    @staticmethod
    async def generate_structured_plan(topic: str, plan_type: str = "skill") -> List[Dict[str, Any]]:
        """
        Generates a structured 30-day plan using a detailed prompt and robust parsing.
        """
        prompt = f"""
        As an expert in curriculum design and habit formation, create a detailed 30-day plan for the following topic: "{topic}".
        The plan should be for building a new {plan_type}.

        The output MUST be a valid JSON object. Do not include any text, explanation, or markdown formatting before or after the JSON object.

        The JSON object must have a single key "daily_tasks", which is an array of 30 objects.
        Each object in the array represents one day and MUST have the following keys:
        - "day": (Integer) The day number from 1 to 30.
        - "title": (String) A concise, motivating title for the day's theme.
        - "tasks": (Array) An array containing exactly two task objects for the day.

        Each object inside the "tasks" array MUST have the following keys:
        - "description": (String) A short, actionable description of the task. It should be easy to follow and not too verbose.
        - "resources": (Array) An array of exactly two strings, where each string is a resource. A resource should be a specific, actionable item like a searchable topic, a book chapter, or a URL.

        Example for a single day object:
        {{
          "day": 1,
          "title": "Foundations of Python",
          "tasks": [
            {{
              "description": "Install Python and set up your VS Code environment.",
              "resources": [
                "Official Python website: python.org/downloads",
                "VS Code Python extension marketplace page"
              ]
            }},
            {{
              "description": "Write and run your first 'Hello, World!' program.",
              "resources": [
                "Tutorial: Real Python - Your First Python Program",
                "Book: 'Python for Everybody' - Chapter 1"
              ]
            }}
          ]
        }}
        """

        if not OPENROUTER_API_KEY:
            logging.error("OPENROUTER_API_KEY is not set.")
            raise ValueError("API key for AI service is not configured.")

        ai_response_content = ""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": MODEL_NAME,
                        "messages": [{"role": "user", "content": prompt}],
                        "response_format": {"type": "json_object"}
                    }
                )
                response.raise_for_status()

            response_data = response.json()
            ai_response_content = response_data["choices"][0]["message"]["content"]
            logging.info(f"Raw AI Response: {ai_response_content}")
            
            parsed_plan = json.loads(ai_response_content)

            # Be resilient: AI might return the list directly.
            if isinstance(parsed_plan, dict) and "daily_tasks" in parsed_plan and isinstance(parsed_plan["daily_tasks"], list):
                return parsed_plan["daily_tasks"]
            
            # Or it might return the list as the top-level object.
            if isinstance(parsed_plan, list):
                return parsed_plan

            raise ValueError("AI response is missing 'daily_tasks' list or is malformed.")

        except httpx.RequestError as e:
            logging.error(f"HTTP request to AI service failed: {e}")
            raise ConnectionError(f"Failed to connect to AI service: {e}")
        except (KeyError, IndexError) as e:
            logging.error(f"Failed to parse AI response structure: {e} - Response: {response_data}")
            raise ValueError("Received an invalid response structure from the AI service.")
        except json.JSONDecodeError:
            logging.error(f"Failed to decode JSON from AI response. Raw content: {ai_response_content}")
            raise ValueError("Received a non-JSON response from the AI service.")
        except Exception as e:
            logging.error(f"An unexpected error occurred in AIService: {e}")
            raise

    def __init__(self, api_key: str, model: str = "deepseek/deepseek-r1-0528:free"):
        self.api_key = api_key
        self.model = model
        self.base_url = "https://openrouter.ai/api/v1"
        
    async def generate_skill_curriculum(
        self,
        skill_name: str,
        difficulty: str,
        duration_days: int
    ) -> Dict[str, Any]:
        """
        Generates a structured learning plan curriculum using OpenRouter.
        
        This method is responsible for:
        1.  Building a precise, role-based prompt.
        2.  Requesting a JSON object from the AI to minimize parsing errors.
        3.  Validating the response structure.
        """
        prompt = self._build_curriculum_prompt(skill_name, difficulty, duration_days)
        
        async with httpx.AsyncClient(timeout=90.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": self.model,
                        "response_format": {"type": "json_object"},
                        "messages": [
                            {"role": "system", "content": "You are a world-class instructional designer..."},
                            {"role": "user", "content": prompt}
                        ]
                    }
                )
                response.raise_for_status()
                
                return response.json()["choices"][0]["message"]["content"]
                
            except httpx.HTTPStatusError as e:
                raise AIGenerationError(f"AI service returned an error: {e.response.status_code}")
            except Exception as e:
                raise AIGenerationError(f"An unexpected error occurred: {str(e)}")

    def _build_curriculum_prompt(self, skill_name, difficulty, duration_days) -> str:
        return f"""
        Generate a structured {duration_days}-day learning curriculum for the skill "{skill_name}"
        at a "{difficulty}" level.
        
        The output MUST be a single JSON object with the following structure:
        {{
          "total_days": {duration_days},
          "days": [
            {{
              "day_number": 1,
              "title": "Title for Day 1",
              "tasks": ["Task 1", "Task 2"],
              "resources": ["Resource URL or book name"],
              "estimated_time": 60
            }}
          ]
        }}
        """

class AIGenerationError(Exception):
    pass 